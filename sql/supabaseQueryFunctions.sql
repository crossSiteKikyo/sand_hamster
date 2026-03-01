-- 익명 쿼리: title, tags로 검색하는 기능
-- 유저 쿼리: 싫어요 태그 포함한것 제거, 싫어요 갤러리 포함한것 제거 후 title, tags로 검색하는 기능

-- tags를 모두 포함하는 갤러리만 필터링하는 것은 GROUP BY + HAVING을 서브쿼리하는 inner join으로 한다. GROUP BY + HAVING 이 sqlite에서 느릴 수 있지만 postgresql에서는 빠르다.
-- 싫어하는 태그가 하나라도 포함된 갤러리 제외하는 것은 not Exists의 서브쿼리로 한다.

-- limit + offset으로 하면 메모리를 많이 사용해서 안되겠다. supabase무료 플랜에서는 500MB까지만 주는데, 거의 10메가도 안남는다. cursor pagination으로 해야겠다.
-- limit + offset 방법은 정말 쓰레기같고, 대체 방법은 두가지 있다. 
-- cursor 방법은 제일 빠르고 항상 속도가 일정하다. 대신 이전 or 이후 페이징만 가능하다. "35페이지로 이동" 이런게 불가능.
-- subquery jump 방법이 있는데, 숫자 페이지네이션을 그대로 사용할 수 있다. limit + offset보다는 훨씬 빠르지만, cursor보다는 느리다. offset이 늘어나면 느려지긴 한다.
-- 일단 subquery jump 방법으로 해보고, 이것도 느리다 싶으면 cursor방식을 사용하자.
-- subquery jump방식도 느려서 자꾸 timeout이 난다. cursor방식으로 할 수밖에....

-- 태그 정보 검색 함수.
create or replace function get_tags_info_by_ids(
  p_tag_ids bigint[]
)
returns table (
  tag_id INT8, name TEXT, like_count INT, dislike_count INT, thumbnails TEXT[]
)
language plpgsql
as $$
begin
  return query
  -- unnest와 with ordinality를 사용하여 보낸 배열의 순서를 보존합니다.
  select 
    t.tag_id, t.name, 
    t.like_count, t.dislike_count,
    array(
      select g.thumb1 
      from gallery_tag gt 
      join gallery g on gt.g_id = g.g_id 
      where gt.tag_id = t.tag_id 
      order by g.g_id desc 
      limit 3
    ) as thumbnails
  from unnest(p_tag_ids) with ordinality as input(tid, ord)
  join tag t on t.tag_id = input.tid
  order by input.ord; -- 프론트에서 보낸 배열 순서 그대로 반환
end;
$$;

-- 유저 좋아요 태그가 하나라도 포함된 갤러리 검색 함수
create or replace function get_user_galleries_only_like_tag(
  p_cursor_id bigint default null,
  p_direction text default 'next', -- 'next' 또는 'prev'
  p_limit int default 25
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
#variable_conflict use_column
declare
  _fetch_limit int;
begin
  -- 요청한 limit보다 1개 더 가져와서 다음 페이지 존재 여부를 확인합니다.
  _fetch_limit := p_limit + 1;
  return query
  with target_ids as (
    select gt.g_id
    from gallery_tag gt
    inner join user_tag_like utl on gt.tag_id = utl.tag_id
    where utl.user_id = auth.uid()
      and utl.flag = true
      and (
        case 
          when p_direction = 'next' then (p_cursor_id is null or gt.g_id < p_cursor_id)
          when p_direction = 'prev' then (gt.g_id > p_cursor_id)
        end
      )
    group by gt.g_id
    order by 
      case when p_direction = 'next' then gt.g_id end desc,
      case when p_direction = 'prev' then gt.g_id end asc
    limit _fetch_limit
  )
  select g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
         g.type_id, g.like_count, g.dislike_count, g.view_count,
         (select json_agg(gt.*) from gallery_tag gt where gt.g_id = g.g_id)
  from target_ids ti 
  join gallery g on ti.g_id = g.g_id
  order by g.g_id desc;
end;
$$;

-- 유저 좋아요/싫어요 갤러리 검색 함수
create or replace function get_user_galleries_like(
  p_cursor_id bigint default null,
  p_direction text default 'next', -- 'next' 또는 'prev'
  p_flag boolean default true,
  p_limit int default 25
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
#variable_conflict use_column
declare
  _fetch_limit int;
begin
  -- 요청한 limit보다 1개 더 가져와서 다음 페이지 존재 여부를 확인합니다.
  _fetch_limit := p_limit + 1;
  return query
  with target_ids as (
    -- 인덱스를 사용해서 필요한 g_id만 빠르게 추출
    select ugl.g_id
    from user_gallery_like ugl
    where ugl.user_id = auth.uid()
      and ugl.flag = p_flag
      and (
        case 
          when p_direction = 'next' then (p_cursor_id is null or ugl.g_id < p_cursor_id)
          when p_direction = 'prev' then (ugl.g_id > p_cursor_id)
        end
      )
    order by 
      case when p_direction = 'next' then ugl.g_id end desc,
      case when p_direction = 'prev' then ugl.g_id end asc
    limit _fetch_limit
  )
  select g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
         g.type_id, g.like_count, g.dislike_count, g.view_count,
         (select json_agg(gt.*) from gallery_tag gt where gt.g_id = g.g_id)
  from target_ids ti 
  join gallery g on ti.g_id = g.g_id
  order by g.g_id desc;
end;
$$;

-- 최종 cursor로 검색 함수
create or replace function search_galleries_smart_cursor(
  p_title text,
  search_tags bigint[],
  p_cursor_id bigint default null,
  p_direction text default 'next', -- 'next' 또는 'prev'
  p_limit int default 25
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
#variable_conflict use_column
declare
  _fetch_limit int;
begin
  -- 요청한 limit보다 1개 더 가져와서 다음 페이지 존재 여부를 확인합니다.
  _fetch_limit := p_limit + 1;
  -- [분기] 로그인 여부에 따라 로직을 완전히 분리 (PostgreSQL 실행 계획 최적화)
  if auth.uid() is null then
    ---------------------------------------------------------
    -- 1. 익명 사용자용 (차단 필터 없음)
    ---------------------------------------------------------
    return query
    with raw_data as (
      select g.*
      from gallery g
      -- 태그가 있을 때만 JOIN 효율이 나도록 처리 (데이터가 많을 시 성능 핵심)
      left join gallery_tag gt on (
        search_tags is not null and 
        array_length(search_tags, 1) is not null and 
        g.g_id = gt.g_id
      )
      where (p_title = '' or g.title ilike '%' || p_title || '%')
        -- [방향성 필터]
        and (
          case 
            when p_direction = 'next' then (p_cursor_id is null or g.g_id < p_cursor_id)
            when p_direction = 'prev' then (g.g_id > p_cursor_id)
          end
        )
        -- [태그 포함 필터] 지적해주신 빈 배열 대응 로직
        and (
          search_tags is null or 
          array_length(search_tags, 1) is null or 
          gt.tag_id = any(search_tags)
        )
      group by g.g_id
      -- [태그 개수 일치 필터] 지적해주신 빈 배열 대응 로직
      having (
        search_tags is null or 
        array_length(search_tags, 1) is null or 
        count(gt.tag_id) = array_length(search_tags, 1)
      )
      order by 
        case when p_direction = 'next' then g.g_id end desc,
        case when p_direction = 'prev' then g.g_id end asc
      limit _fetch_limit
    )
    select rd.g_id, rd.title, rd.thumb1, rd.thumb2, rd.date, rd.filecount, 
           rd.type_id, rd.like_count, rd.dislike_count, rd.view_count,
           (select json_agg(gt2.*) from gallery_tag gt2 where gt2.g_id = rd.g_id)
    from raw_data rd
    order by rd.g_id desc; -- 항상 최신순으로 결과 반환

  else
    ---------------------------------------------------------
    -- 2. 로그인 사용자용 (싫어하는 갤러리/태그 제외)
    ---------------------------------------------------------
    return query
    with raw_data as (
      select g.*
      from gallery g
      left join gallery_tag gt on (
        search_tags is not null and 
        array_length(search_tags, 1) is not null and 
        g.g_id = gt.g_id
      )
      where (p_title = '' or g.title ilike '%' || p_title || '%')
        and (
          case 
            when p_direction = 'next' then (p_cursor_id is null or g.g_id < p_cursor_id)
            when p_direction = 'prev' then (g.g_id > p_cursor_id)
          end
        )
        -- [유저 제외 필터]
        and not exists (
          select 1 from user_gallery_like ugl 
          where ugl.g_id = g.g_id and ugl.user_id = auth.uid() and ugl.flag = false
        )
        and not exists (
          select 1 from gallery_tag gt_exc
          join user_tag_like utl on gt_exc.tag_id = utl.tag_id
          where gt_exc.g_id = g.g_id and utl.user_id = auth.uid() and utl.flag = false
        )
        and (
          search_tags is null or 
          array_length(search_tags, 1) is null or 
          gt.tag_id = any(search_tags)
        )
      group by g.g_id
      having (
        search_tags is null or 
        array_length(search_tags, 1) is null or 
        count(gt.tag_id) = array_length(search_tags, 1)
      )
      order by 
        case when p_direction = 'next' then g.g_id end desc,
        case when p_direction = 'prev' then g.g_id end asc
      limit _fetch_limit
    )
    select rd.g_id, rd.title, rd.thumb1, rd.thumb2, rd.date, rd.filecount, 
           rd.type_id, rd.like_count, rd.dislike_count, rd.view_count,
           (select json_agg(gt2.*) from gallery_tag gt2 where gt2.g_id = rd.g_id)
    from raw_data rd
    order by rd.g_id desc;
  end if;
end;
$$;

-- 익명 검색 쿼리-subquery jump방식
-- create or replace function search_galleries_anonymous(
--   p_title text,
--   search_tags bigint[],
--   p_limit int default 20,
--   p_offset int default 0
-- )
-- returns table (
--   g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
--   type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
-- )
-- language plpgsql
-- as $$
-- #variable_conflict use_column
-- begin
--   return query
--   with target_ids as (
--     -- [1단계] 인덱스만 활용해 "가벼운" ID 리스트 20개만 먼저 확보
--     select g.g_id
--     from gallery g
--     left join gallery_tag gt2 on (search_tags is not null and g.g_id = gt2.g_id)
--     where (p_title = '' or g.title ilike '%' || p_title || '%')
--       and (
--         search_tags is null 
--         or array_length(search_tags, 1) is null 
--         or gt2.tag_id = any(search_tags)
--       )
--     group by g.g_id
--     having (
--       search_tags is null 
--       or array_length(search_tags, 1) is null 
--       or count(gt2.tag_id) = array_length(search_tags, 1)
--     )
--     order by g.g_id desc
--     limit p_limit offset p_offset
--   )
--   -- [2단계] 확정된 20개의 ID에 대해서만 "무거운" 컬럼(이미지, JSON)을 조인
--   select 
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--   from gallery g
--   inner join target_ids t on g.g_id = t.g_id
--   order by g.g_id desc;
-- end;
-- $$;

-- 유저 쿼리-subquery jump방식
-- create or replace function search_galleries_user(
--   p_title text,
--   search_tags bigint[],
--   p_limit int default 20,
--   p_offset int default 0
-- )
-- returns table (
--   g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
--   type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
-- )
-- language plpgsql
-- as $$
-- #variable_conflict use_column
-- begin
--   return query
--   with target_ids as (
--     select g.gid from gallery g
--     left join gallery_tag gt2 on (search_tags is not null and g.g_id = gt2.g_id)
--     where (p_title = '' or g.title ilike '%' || p_title || '%')
--       -- 싫어하는 갤러리 제외 필터링
--       and not exists (
--         select 1 from user_gallery_like ugl
--         where ugl.g_id = g.g_id
--         and ugl.user_id = auth.uid()
--         and ugl.flag = false
--       )
--       -- 싫어하는 태그 제외 필터링
--       and not exists (
--         select 1 
--         from gallery_tag gt3
--         join user_tag_like utl on gt3.tag_id = utl.tag_id
--         where gt3.g_id = g.g_id
--           and utl.user_id = auth.uid()
--           and utl.flag = false
--       )
--       and (
--         search_tags is null 
--         or array_length(search_tags, 1) is null 
--         or gt2.tag_id = any(search_tags)
--       )
--     group by g.g_id
--     having (
--       search_tags is null 
--       or array_length(search_tags, 1) is null 
--       or count(gt2.tag_id) = array_length(search_tags, 1)
--     )
--     order by g.g_id desc
--     limit p_limit offset p_offset
--   )
--   select
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--   from gallery g
--   inner join target_ids t on g.g_id = t.g_id
--   order by g.g_id desc;
-- end;
-- $$;

-- 쌩 limit + offset방식 유저 쿼리.
-- create or replace function search_galleries_user(
--   p_title text,
--   search_tags bigint[],
--   p_limit int default 20,
--   p_offset int default 0
-- )
-- returns table (
--   g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
--   type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
-- )
-- language plpgsql
-- as $$
-- -- 변수와 컬럼명이 겹칠 때 테이블 컬럼을 우선하라는 설정
-- #variable_conflict use_column
-- begin
--   -- 1. 태그가 없는 경우 (단순 제목 검색)
--   if search_tags is null or array_length(search_tags, 1) is null then
--     return query
--     select 
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--     -- as gallery_tag
--     from gallery g
--     -- 제목 검색. ''이면 통과, 아니면 ilike로 `%${p_title}%`식으로 찾는다.
--     WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
--     -- 싫어하는 갤러리 제외 필터링
--     and not exists (
--       select 1 from user_gallery_like ugl
--       where ugl.g_id = g.g_id
--       and ugl.user_id = auth.uid()
--       and ugl.flag = false
--     )
--     -- 싫어하는 태그 제외 필터링
--     and not exists (
--       select 1 
--       from gallery_tag gt3
--       join user_tag_like utl on gt3.tag_id = utl.tag_id
--       where gt3.g_id = g.g_id
--         and utl.user_id = auth.uid()
--         and utl.flag = false
--     )
--     order by 
--       g.g_id desc
--     limit p_limit offset p_offset;

--   -- 2. 태그가 있는 경우 (조인 필터링 검색)
--   else
--     return query
--     select 
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--     from gallery g
--     -- 포함되어야 할 태그 필터링
--     join (
--         select g_id
--         from gallery_tag
--         where tag_id = any(search_tags)
--         group by g_id
--         having count(tag_id) = array_length(search_tags, 1)
--     ) as filter on g.g_id = filter.g_id
--     WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
--     and not exists (
--       select 1 from user_gallery_like ugl
--       where ugl.g_id = g.g_id
--       and ugl.user_id = auth.uid()
--       and ugl.flag = false
--     )
--     and not exists (
--       select 1 
--       from gallery_tag gt3
--       join user_tag_like utl on gt3.tag_id = utl.tag_id
--       where gt3.g_id = g.g_id
--         and utl.user_id = auth.uid()
--         and utl.flag = false
--     )
--     order by 
--       g.g_id desc
--     limit p_limit offset p_offset;
--   end if;
-- end;
-- $$;

-- 쌩 limit + offset방식 익명 검색 쿼리. db에서 모든 select정보를 메모리에 올렸다가 버리는 방식이라서 오버헤드가 크다.
-- create or replace function search_galleries_anonymous(
--   p_title text,
--   search_tags bigint[],
--   p_limit int default 20,
--   p_offset int default 0
-- )
-- returns table (
--   g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
--   type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
-- )
-- language plpgsql
-- as $$
-- -- 변수와 컬럼명이 겹칠 때 테이블 컬럼을 우선하라는 설정
-- #variable_conflict use_column
-- begin
--   -- 1. 태그가 없는 경우 (단순 제목 검색)
--   if search_tags is null or array_length(search_tags, 1) is null then
--     return query
--     select 
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--     -- as gallery_tag
--     from gallery g
--     -- 제목 검색. ''이면 통과, 아니면 ilike로 `%${p_title}%`식으로 찾는다.
--     WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
--     order by 
--       g.g_id desc
--     limit p_limit offset p_offset;

--   -- 2. 태그가 있는 경우 (조인 필터링 검색)
--   else
--     return query
--     select 
--     g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
--     g.type_id, g.like_count, g.dislike_count, g.view_count,
--     (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
--     from gallery g
--     -- 포함되어야 할 태그 필터링
--     join (
--         select g_id
--         from gallery_tag
--         where tag_id = any(search_tags)
--         group by g_id
--         having count(tag_id) = array_length(search_tags, 1)
--     ) as filter on g.g_id = filter.g_id
--     -- 제목 검색
--     WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
--     order by 
--       g.g_id desc
--     limit p_limit offset p_offset;
--   end if;
-- end;
-- $$;
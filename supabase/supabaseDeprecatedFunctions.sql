
-- 유저 좋아요/싫어요 갤러리 검색 함수
-- 브라우저에서 g_id정보들을 들고있기 때문에, 이 함수가 필요 없어짐.
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

-- 쌩 limit + offset은 오래걸리고 메모리도 많이 먹어서 버려짐.
-- subquery jump방식은 쌩 limit+offset보다 훨씬 좋지만, 충분히 좋지 못함.
-- 결국 cursor페이지네이션으로 하면서 둘다 버려진 방법

-- 익명 검색 쿼리-subquery jump방식
create or replace function search_galleries_anonymous(
  p_title text,
  search_tags bigint[],
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  with target_ids as (
    -- [1단계] 인덱스만 활용해 "가벼운" ID 리스트 20개만 먼저 확보
    select g.g_id
    from gallery g
    left join gallery_tag gt2 on (search_tags is not null and g.g_id = gt2.g_id)
    where (p_title = '' or g.title ilike '%' || p_title || '%')
      and (
        search_tags is null 
        or array_length(search_tags, 1) is null 
        or gt2.tag_id = any(search_tags)
      )
    group by g.g_id
    having (
      search_tags is null 
      or array_length(search_tags, 1) is null 
      or count(gt2.tag_id) = array_length(search_tags, 1)
    )
    order by g.g_id desc
    limit p_limit offset p_offset
  )
  -- [2단계] 확정된 20개의 ID에 대해서만 "무거운" 컬럼(이미지, JSON)을 조인
  select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
  from gallery g
  inner join target_ids t on g.g_id = t.g_id
  order by g.g_id desc;
end;
$$;

-- 유저 쿼리-subquery jump방식
create or replace function search_galleries_user(
  p_title text,
  search_tags bigint[],
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  with target_ids as (
    select g.gid from gallery g
    left join gallery_tag gt2 on (search_tags is not null and g.g_id = gt2.g_id)
    where (p_title = '' or g.title ilike '%' || p_title || '%')
      -- 싫어하는 갤러리 제외 필터링
      and not exists (
        select 1 from user_gallery_like ugl
        where ugl.g_id = g.g_id
        and ugl.user_id = auth.uid()
        and ugl.flag = false
      )
      -- 싫어하는 태그 제외 필터링
      and not exists (
        select 1 
        from gallery_tag gt3
        join user_tag_like utl on gt3.tag_id = utl.tag_id
        where gt3.g_id = g.g_id
          and utl.user_id = auth.uid()
          and utl.flag = false
      )
      and (
        search_tags is null 
        or array_length(search_tags, 1) is null 
        or gt2.tag_id = any(search_tags)
      )
    group by g.g_id
    having (
      search_tags is null 
      or array_length(search_tags, 1) is null 
      or count(gt2.tag_id) = array_length(search_tags, 1)
    )
    order by g.g_id desc
    limit p_limit offset p_offset
  )
  select
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
  from gallery g
  inner join target_ids t on g.g_id = t.g_id
  order by g.g_id desc;
end;
$$;

-- 쌩 limit + offset방식 유저 쿼리.
create or replace function search_galleries_user(
  p_title text,
  search_tags bigint[],
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
-- 변수와 컬럼명이 겹칠 때 테이블 컬럼을 우선하라는 설정
#variable_conflict use_column
begin
  -- 1. 태그가 없는 경우 (단순 제목 검색)
  if search_tags is null or array_length(search_tags, 1) is null then
    return query
    select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
    -- as gallery_tag
    from gallery g
    -- 제목 검색. ''이면 통과, 아니면 ilike로 `%${p_title}%`식으로 찾는다.
    WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
    -- 싫어하는 갤러리 제외 필터링
    and not exists (
      select 1 from user_gallery_like ugl
      where ugl.g_id = g.g_id
      and ugl.user_id = auth.uid()
      and ugl.flag = false
    )
    -- 싫어하는 태그 제외 필터링
    and not exists (
      select 1 
      from gallery_tag gt3
      join user_tag_like utl on gt3.tag_id = utl.tag_id
      where gt3.g_id = g.g_id
        and utl.user_id = auth.uid()
        and utl.flag = false
    )
    order by 
      g.g_id desc
    limit p_limit offset p_offset;

  -- 2. 태그가 있는 경우 (조인 필터링 검색)
  else
    return query
    select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
    from gallery g
    -- 포함되어야 할 태그 필터링
    join (
        select g_id
        from gallery_tag
        where tag_id = any(search_tags)
        group by g_id
        having count(tag_id) = array_length(search_tags, 1)
    ) as filter on g.g_id = filter.g_id
    WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
    and not exists (
      select 1 from user_gallery_like ugl
      where ugl.g_id = g.g_id
      and ugl.user_id = auth.uid()
      and ugl.flag = false
    )
    and not exists (
      select 1 
      from gallery_tag gt3
      join user_tag_like utl on gt3.tag_id = utl.tag_id
      where gt3.g_id = g.g_id
        and utl.user_id = auth.uid()
        and utl.flag = false
    )
    order by 
      g.g_id desc
    limit p_limit offset p_offset;
  end if;
end;
$$;

-- 쌩 limit + offset방식 익명 검색 쿼리. db에서 모든 select정보를 메모리에 올렸다가 버리는 방식이라서 오버헤드가 크다.
create or replace function search_galleries_anonymous(
  p_title text,
  search_tags bigint[],
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, filecount INT, 
  type_id INT8, like_count INT, dislike_count INT, view_count INT, gallery_tag JSON
)
language plpgsql
as $$
-- 변수와 컬럼명이 겹칠 때 테이블 컬럼을 우선하라는 설정
#variable_conflict use_column
begin
  -- 1. 태그가 없는 경우 (단순 제목 검색)
  if search_tags is null or array_length(search_tags, 1) is null then
    return query
    select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
    -- as gallery_tag
    from gallery g
    -- 제목 검색. ''이면 통과, 아니면 ilike로 `%${p_title}%`식으로 찾는다.
    WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
    order by 
      g.g_id desc
    limit p_limit offset p_offset;

  -- 2. 태그가 있는 경우 (조인 필터링 검색)
  else
    return query
    select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, g.filecount, 
    g.type_id, g.like_count, g.dislike_count, g.view_count,
    (SELECT json_agg(gt.*) FROM gallery_tag gt WHERE gt.g_id = g.g_id)
    from gallery g
    -- 포함되어야 할 태그 필터링
    join (
        select g_id
        from gallery_tag
        where tag_id = any(search_tags)
        group by g_id
        having count(tag_id) = array_length(search_tags, 1)
    ) as filter on g.g_id = filter.g_id
    -- 제목 검색
    WHERE (p_title = '' OR g.title ILIKE '%' || p_title || '%')
    order by 
      g.g_id desc
    limit p_limit offset p_offset;
  end if;
end;
$$;
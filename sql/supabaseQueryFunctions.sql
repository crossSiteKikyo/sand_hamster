-- 익명 쿼리: title, tags로 검색하는 기능
-- 유저 쿼리: 싫어요 태그 포함한것 제거, 싫어요 갤러리 포함한것 제거 후 title, tags로 검색하는 기능

-- tags를 모두 포함하는 갤러리만 필터링하는 것은 GROUP BY + HAVING을 서브쿼리하는 inner join으로 한다. GROUP BY + HAVING 이 sqlite에서 느릴 수 있지만 postgresql에서는 빠르다.
-- 싫어하는 태그가 하나라도 포함된 갤러리 제외하는 것은 not Exists의 서브쿼리로 한다.

-- 익명 쿼리. 성능이 안나온다면 나중에 gallery_tag 테이블의 (tag_id, g_id) 복합 인덱스 만들어야한다.
create or replace function search_galleries_anonymous(
  p_title text,
  search_tags bigint[],
  p_sort_by text default 'g_id', -- 'g_id', 'like_count', 'view_count'
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
    -- p_sort_by 값에 따라 정렬 기준 분기
      (case when p_sort_by = 'like_count' then g.like_count end) desc,
      (case when p_sort_by = 'view_count' then g.view_count end) desc,
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
      (case when p_sort_by = 'like_count' then g.like_count end) desc,
      (case when p_sort_by = 'view_count' then g.view_count end) desc,
      g.g_id desc
    limit p_limit offset p_offset;
  end if;
end;
$$;

---------------------------------------- 유저 쿼리
create or replace function search_galleries_user(
  p_title text,
  search_tags bigint[],
  p_sort_by text default 'g_id', -- 'g_id', 'like_count', 'view_count'
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
      from gallery_tag gt_sub
      join user_tag_like utl on gt_sub.tag_id = utl.tag_id
      where gt_sub.g_id = g.g_id
        and utl.user_id = auth.uid()
        and utl.flag = false
    )
    order by 
    -- p_sort_by 값에 따라 정렬 기준 분기
      (case when p_sort_by = 'like_count' then g.like_count end) desc,
      (case when p_sort_by = 'view_count' then g.view_count end) desc,
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
      from gallery_tag gt_sub
      join user_tag_like utl on gt_sub.tag_id = utl.tag_id
      where gt_sub.g_id = g.g_id
        and utl.user_id = auth.uid()
        and utl.flag = false
    )
    order by 
      (case when p_sort_by = 'like_count' then g.like_count end) desc,
      (case when p_sort_by = 'view_count' then g.view_count end) desc,
      g.g_id desc
    limit p_limit offset p_offset;
  end if;
end;
$$;

-- create or replace function search_galleries_user(
--   search_tags bigint[],
--   p_limit int default 20,
--   p_offset int default 0
-- )
-- returns setof gallery
-- language plpgsql
-- as $$
-- begin
--   return query
--   select g.*
--   from gallery g
--   -- 1. 포함되어야 할 태그 필터링
--   join (
--     select g_id
--     from gallery_tag
--     where tag_id = any(search_tags)
--     group by g_id
--     having count(tag_id) = array_length(search_tags, 1)
--   ) filter on g.g_id = filter.g_id
--   -- 2. 싫어하는 태그 제외 필터링 (로그인한 유저 기준)
--   where not exists (
--     select 1 
--     from gallery_tag gt_sub
--     join user_tag_like utl on gt_sub.tag_id = utl.tag_id
--     where gt_sub.g_id = g.g_id
--       and utl.user_id = auth.uid()
--       and utl.flag = false
--   )
--   order by g.g_id desc
--   limit p_limit
--   offset p_offset;
-- end;
-- $$;
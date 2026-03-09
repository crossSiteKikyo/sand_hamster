-- 익명 쿼리: title, tags로 검색하는 기능
-- 유저 쿼리: 싫어요 태그 포함한것 제거, 싫어요 갤러리 포함한것 제거 후 title, tags로 검색하는 기능

-- tags를 모두 포함하는 갤러리만 필터링하는 것은 GROUP BY + HAVING을 서브쿼리하는 inner join으로 한다. GROUP BY + HAVING 이 sqlite에서 느릴 수 있지만 postgresql에서는 빠르다.
-- 싫어하는 태그가 하나라도 포함된 갤러리 제외하는 것은 not Exists의 서브쿼리로 한다.
-- 한 요청당 반환 갤러리 수는 20개

-- 태그 정보 검색 함수.
create or replace function get_tags_info_by_ids(
  p_tag_ids bigint[]
)
returns table (
  tag_id INT8, name TEXT, thumbnails TEXT[]
)
language plpgsql
as $$
begin
  return query
  -- unnest와 with ordinality를 사용하여 보낸 배열의 순서를 보존합니다.
  select 
    t.tag_id, t.name,
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

-- id들로 갤러리 상세 정보 검색 함수.
create or replace function get_galleries_detail_by_ids(
  p_gallery_ids bigint[]
)
returns table (
  g_id INT8, title TEXT, thumb1 TEXT, thumb2 TEXT, date TIMESTAMPTZ, 
  filecount INT, type_id INT8, view_count INT, ver INT2, tag_ids BIGINT[]
)
language plpgsql
as $$
begin
  return query
  -- unnest와 with ordinality를 사용하여 프론트엔드가 보내준 배열 순서를 엄격히 유지합니다.
  select 
    g.g_id, g.title, g.thumb1, g.thumb2, g.date, 
    g.filecount, g.type_id, g.view_count, g.ver,
    array(select gt.tag_id from gallery_tag gt where gt.g_id = g.g_id) as tag_ids
  from unnest(p_gallery_ids) with ordinality as input(gid, ord)
  join gallery g on g.g_id = input.gid
  order by input.ord; -- 배열 순서대로 정렬하여 반환
end;
$$;

-- g_id들로 갤러리 요약 정보 얻기
create or replace function get_galleries_summary_by_ids(
  p_gallery_ids bigint[]
)
returns table (
  g_id INT8, view_count INT, ver INT2
)
language plpgsql
as $$
begin
  return query
  -- unnest와 with ordinality를 사용하여 프론트엔드가 보내준 배열 순서를 엄격히 유지합니다.
  select 
    g.g_id, g.view_count, g.ver
  from unnest(p_gallery_ids) with ordinality as input(gid, ord)
  join gallery g on g.g_id = input.gid
  order by input.ord; -- 배열 순서대로 정렬하여 반환
end;
$$;

-- 유저 좋아요 태그가 하나라도 포함된 갤러리 검색 함수
-- limit(20개)보다 1개 더 가져와서 다음 페이지 존재 여부를 확인합니다.
create or replace function get_galleries_summary_user_only_like_tag(
  p_cursor_id bigint default null,
  p_direction text default 'next' -- 'next' 또는 'prev'
)
returns table (
  g_id INT8, view_count INT, ver INT2
)
language plpgsql
as $$
#variable_conflict use_column
begin
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
      limit 21
    )
    select g.g_id, g.view_count, g.ver
    from target_ids ti
    join gallery g on ti.g_id = g.g_id
    order by g.g_id desc;
end;
$$;

-- 최종 cursor로 검색 함수
-- limit(20개)보다 1개 더 가져온다. 이함수만 prev일 때, 거꾸로 가져온다.
create or replace function search_galleries_summary_cursor(
  p_title text,
  search_tags bigint[],
  p_cursor_id bigint default null,
  p_direction text default 'next' -- 'next' 또는 'prev'
)
returns table (
  g_id INT8, view_count INT, ver INT2
)
language plpgsql
as $$
#variable_conflict use_column
begin
  -- [분기] 로그인 여부에 따라 로직을 완전히 분리 (PostgreSQL 실행 계획 최적화)
  if auth.uid() is null then
    ---------------------------------------------------------
    -- 1. 익명 사용자용 (차단 필터 없음)
    ---------------------------------------------------------
    return query
      select g.g_id, g.view_count, ver
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
      limit 21;

  else
    ---------------------------------------------------------
    -- 2. 로그인 사용자용 (싫어하는 갤러리/태그 제외)
    ---------------------------------------------------------
    return query
      select g.g_id, g.view_count, ver
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
      limit 21;
  end if;
end;
$$;
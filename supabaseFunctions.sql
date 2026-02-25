-- gallery와 gallery_tag를 트랜잭션으로 insert
CREATE OR REPLACE FUNCTION insert_gallery_with_tags(
  p_g_id int8,
  p_title text,
  p_thumb1 text,
  p_thumb2 text,
  p_date timestamptz,
  p_filecount int4,
  p_type_id int8,
  p_tag_ids int8[]
) RETURNS void AS $$
BEGIN
  -- 1. gallery 테이블에 UPSERT (이미 있으면 업데이트, 없으면 삽입)
  INSERT INTO gallery (g_id, title, thumb1, thumb2, date, filecount, type_id)
  VALUES (p_g_id, p_title, p_thumb1, p_thumb2, p_date, p_filecount, p_type_id)
  ON CONFLICT (g_id) DO UPDATE SET
    title = EXCLUDED.title,
    thumb1 = EXCLUDED.thumb1,
    thumb2 = EXCLUDED.thumb2,
    date = EXCLUDED.date,
    filecount = EXCLUDED.filecount,
    type_id = EXCLUDED.type_id;

  -- 2. 기존 태그 관계 삭제 (업데이트 시 중복 관계 방지)
  DELETE FROM gallery_tag WHERE g_id = p_g_id;

  -- 3. 새로운 태그 ID 배열 삽입
  INSERT INTO gallery_tag (g_id, tag_id)
  SELECT p_g_id, unnest(p_tag_ids);
END;

-- 현재 로그인한 사용자의 계정을 삭제하는 함수
create or replace function delete_user()
returns void
language plpgsql
security definer -- 관리자 권한으로 실행되도록 설정
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- 새 사용자가 가입할 때 실행될 함수
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$;

-- auth.users에 insert가 발생한 직후에 함수를 실행하는 트리거
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- user_gallery_like 테이블에 insert할 때, profiles의 gallery_like_limit 개수를 넘지 못하게 한다

-- user_tag_like 테이블에 insert할 때, profiles의 tag_like_limit 개수를 넘지 못하게 한다
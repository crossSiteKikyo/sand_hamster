-- 비공개 스키마 생성 (유저가 rpc로 실행하지 못한다)
CREATE SCHEMA IF NOT EXISTS private;

-- 랭킹 집계 함수. 일단 20개씩 했다.
CREATE OR REPLACE FUNCTION private.update_rankings()
RETURNS void AS $$
BEGIN
  -- 기존 데이터 삭제
  DELETE FROM public.ranking;
  -- 1. 갤러리 조회수 순 (gallery.date 기준)
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_view', 'daily', array(
    SELECT g_id FROM public.gallery WHERE date >= now() - INTERVAL '1 day' ORDER BY view_count DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_view', 'weekly', array(
    SELECT g_id FROM public.gallery WHERE date >= now() - INTERVAL '7 days' ORDER BY view_count DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_view', 'monthly', array(
    SELECT g_id FROM public.gallery WHERE date >= now() - INTERVAL '30 days' ORDER BY view_count DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_view', 'all_time', array(
    SELECT g_id FROM public.gallery ORDER BY view_count DESC LIMIT 20
  );
  -- 2. 갤러리 좋아요 순 (user_gallery_like 발생일 기준)
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_like', 'daily', array(
    SELECT g_id FROM public.user_gallery_like WHERE flag = true AND created_at >= now() - INTERVAL '1 day' GROUP BY g_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_like', 'weekly', array(
    SELECT g_id FROM public.user_gallery_like WHERE flag = true AND created_at >= now() - INTERVAL '7 days' GROUP BY g_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_like', 'monthly', array(
    SELECT g_id FROM public.user_gallery_like WHERE flag = true AND created_at >= now() - INTERVAL '30 days' GROUP BY g_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'gallery_like', 'all_time', array(
    SELECT g_id FROM public.user_gallery_like WHERE flag = true GROUP BY g_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  -- 3. 태그 좋아요 순 (user_tag_like 발생일 기준)
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'tag_like', 'daily', array(
    SELECT tag_id FROM public.user_tag_like WHERE flag = true AND date >= now() - INTERVAL '1 day' GROUP BY tag_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'tag_like', 'weekly', array(
    SELECT tag_id FROM public.user_tag_like WHERE flag = true AND date >= now() - INTERVAL '7 days' GROUP BY tag_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'tag_like', 'monthly', array(
    SELECT tag_id FROM public.user_tag_like WHERE flag = true AND date >= now() - INTERVAL '30 days' GROUP BY tag_id ORDER BY COUNT(*) DESC LIMIT 20
  );
  INSERT INTO public.ranking (rank_type, period, ids)
  SELECT 'tag_like', 'all_time', array(
    SELECT tag_id FROM public.user_tag_like WHERE flag = true GROUP BY tag_id ORDER BY COUNT(*) DESC LIMIT 20
  );
END;
$$ LANGUAGE plpgsql;


-- gallery와 gallery_tag를 트랜잭션으로 insert - 크롤링에 사용되는 함수
-- private로 만드려고 했지만, supabase.rpc는 public스키마만 호출 가능하기 때문에 내부로직 추가.
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
  -- 보안 체크: 호출자가 service_role이 아니면 즉시 에러 발생
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION '권한이 없습니다.';
  END IF;

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

-- user_tag_like 업데이트 시 date 컬럼을 자동으로 갱신하는 함수 생성
CREATE OR REPLACE FUNCTION update_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 트리거 등록
CREATE TRIGGER update_user_tag_like_date
    BEFORE UPDATE ON user_tag_like
    FOR EACH ROW
    EXECUTE PROCEDURE update_date_column();

-- user_gallery_like 테이블에 insert할 때, profiles의 gallery_like_limit 개수를 넘지 못하게 한다

-- user_tag_like 테이블에 insert할 때, profiles의 tag_like_limit 개수를 넘지 못하게 한다


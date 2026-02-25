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
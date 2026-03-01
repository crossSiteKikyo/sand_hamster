-- gallery_tag에 tag_id를 첫 번째 컬럼으로 두는 복합 인덱스. 포함되어야 할 태그 검색 때 사용된다. dashboard에서 할 수 있음.
CREATE INDEX ON "public"."gallery_tag" USING btree ("tag_id", "g_id");

-- 유저 갤러리 좋아요/싫어요 검색에 사용되는 인덱스.
-- 이 인덱스가 있으면 ugl 테이블을 뒤질 필요 없이 인덱스 내에서 모든 필터링이 끝납니다.
-- CREATE INDEX idx_ugl_user_flag_gid ON user_gallery_like (user_id, flag, g_id DESC);
CREATE INDEX idx_ugl_user_flag_gid ON "public"."user_gallery_like" USING btree ("user_id", "flag", "g_id" desc);

-- 유저 좋아요 태그가 하나라도 포함된 갤러리 검색에 사용되는 인덱스.
CREATE INDEX ON "public"."user_tag_like" USING btree ("user_id", "flag", "tag_id");

-- 유저 좋아요 태그 리스트를 날짜순으로 가져오는데 사용되는 인덱스. 인덱스 용량이 부족해지지 않겠지..?
CREATE INDEX ON "public"."user_tag_like" USING btree ("user_id", "flag", "date" desc);
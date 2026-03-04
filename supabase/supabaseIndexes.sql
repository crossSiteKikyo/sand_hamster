-- 인덱스 용량에 대한 이해
-- postgresql의 b-tree인덱스는 보통 행당 30~100바이트를 차지한다.
-- 120만건의 gallery_tag의 행 x 30을 하면 36mb정도 최소치다. 실제로 36m, 37m가 나옴.
-- user_tag_like와 user_gallery_like의 인덱스 크기는 어느정도 될까? 행당 100바이트라 치고 계산해보자.
-- 유저 1명당 100개의 행을 삽입하면 1000명일 때 100000행이다. 10mb ~ 15mb정도이다.
-- 한 인덱스당 크기이니, 2개의 인덱스라면 20~30mb정도인것.

-- gallery_tag에 tag_id를 첫 번째 컬럼으로 두는 복합 인덱스. 포함되어야 할 태그 검색 때 사용된다. dashboard에서 할 수 있음.
CREATE INDEX ON "public"."gallery_tag" USING btree ("tag_id", "g_id");

-- 유저 좋아요 태그가 하나라도 포함된 갤러리 검색에 사용되는 인덱스. index only scan을 위해서 date도 추가했다.
-- CREATE INDEX ON "public"."user_tag_like" USING btree ("user_id", "flag", "tag_id");
CREATE INDEX ON "public"."user_tag_like" USING btree ("user_id", "tag_id", "date" desc, "flag");

-- 랭킹 집계를 위한 인덱스들. gallery의 view_count는 자주 변하는 값이니 인덱스에 적합하지 않다.
CREATE INDEX ON "public"."user_gallery_like" USING btree ("created_at", "flag");
CREATE INDEX ON "public"."user_tag_like" USING btree ("date", "flag");

-- 유저 갤러리 좋아요/싫어요 검색에 사용되는 인덱스. g_id배열로 조회하기 때문에 쓸모없게 되었다.
-- 이 인덱스가 있으면 ugl 테이블을 뒤질 필요 없이 인덱스 내에서 모든 필터링이 끝납니다
-- CREATE INDEX idx_ugl_user_flag_gid ON "public"."user_gallery_like" USING btree ("user_id", "flag", "g_id" desc);

-- 유저 좋아요 태그 리스트를 날짜순으로 가져오는데 사용되는 인덱스.
-- CREATE INDEX ON "public"."user_tag_like" USING btree ("user_id", "flag", "date" desc);
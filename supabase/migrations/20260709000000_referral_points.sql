-- 포인트 & 친구 추천 기능
-- Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run 하세요.
-- (한 번만 실행하면 됩니다. 여러 번 실행해도 안전하도록 작성했습니다.)

-- 1) profiles 테이블에 컬럼 추가
--    points        : 보유 포인트
--    referral_code : 내 추천 코드(고유)
--    referred_by   : 나를 추천한 사람(중복 사용 방지용, 1회만 채워짐)
alter table public.profiles
  add column if not exists points integer not null default 0,
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles(id);

-- 추천 코드는 고유해야 함
create unique index if not exists profiles_referral_code_key
  on public.profiles(referral_code);

-- 새로 가입하는 사용자는 자동으로 8자리 추천 코드를 부여받음
-- (profiles 행을 만드는 기존 트리거를 수정하지 않아도 default 로 채워짐)
alter table public.profiles
  alter column referral_code
  set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

-- 이미 가입된 기존 사용자에게 추천 코드 백필
update public.profiles
set referral_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
where referral_code is null;

-- 2) 클라이언트가 포인트/추천 컬럼을 직접 수정하지 못하도록 차단
--    (포인트 지급은 아래 SECURITY DEFINER 함수로만 가능)
revoke update (points, referral_code, referred_by) on public.profiles from authenticated, anon;

-- 3) 추천 코드 사용(양쪽 1000포인트 지급) 함수
--    로그인한 사용자가 친구의 추천 코드를 입력하면,
--    본인과 코드 주인에게 각각 1000포인트를 지급한다. (1인 1회)
create or replace function public.redeem_referral(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_referrer uuid;
begin
  if v_user is null then
    return json_build_object('success', false, 'error', '로그인이 필요합니다.');
  end if;

  -- 이미 추천 코드를 사용한 사용자는 다시 사용할 수 없음
  if exists (select 1 from profiles where id = v_user and referred_by is not null) then
    return json_build_object('success', false, 'error', '이미 추천 코드를 입력했어요.');
  end if;

  -- 코드로 추천인 찾기
  select id into v_referrer
  from profiles
  where referral_code = upper(trim(p_code));

  if v_referrer is null then
    return json_build_object('success', false, 'error', '유효하지 않은 추천 코드예요.');
  end if;

  if v_referrer = v_user then
    return json_build_object('success', false, 'error', '본인 추천 코드는 사용할 수 없어요.');
  end if;

  -- 양쪽에 1000포인트씩 지급 (단일 트랜잭션으로 원자적 처리)
  update profiles set referred_by = v_referrer, points = points + 1000 where id = v_user;
  update profiles set points = points + 1000 where id = v_referrer;

  return json_build_object('success', true, 'awarded', 1000);
end;
$$;

grant execute on function public.redeem_referral(text) to authenticated;

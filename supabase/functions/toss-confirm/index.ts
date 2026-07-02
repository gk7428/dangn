// 토스페이먼츠 결제 승인을 서버에서 처리하는 Supabase Edge Function.
// 시크릿 키는 클라이언트에 절대 노출되면 안 되므로, 결제 승인은 반드시 여기서 수행한다.
//
// 배포:
//   supabase functions deploy toss-confirm
// 시크릿 키 등록:
//   supabase secrets set TOSS_SECRET_KEY=test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6
//
// 클라이언트에서 호출:
//   supabase.functions.invoke('toss-confirm', { body: { paymentKey, orderId, amount } })

import { createClient } from 'jsr:@supabase/supabase-js@2';

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: '로그인이 필요합니다.' }, 401);
    }

    // 호출자가 실제 로그인한 사용자인지 확인한다(익명 결제 승인 남용 방지).
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: '유효하지 않은 세션입니다.' }, 401);
    }

    const { paymentKey, orderId, amount } = await req.json();
    if (!paymentKey || !orderId || typeof amount !== 'number') {
      return json({ error: 'paymentKey, orderId, amount가 필요합니다.' }, 400);
    }

    // TODO(프로덕션): amount를 클라이언트 요청값 그대로 믿지 말고, 주문 생성 시
    // 서버(DB)에 저장해둔 금액과 비교해서 일치할 때만 승인 API를 호출해야 한다.
    // 이 데모에는 주문 테이블이 없어 클라이언트가 보낸 금액을 그대로 사용한다.

    const encodedSecret = btoa(`${TOSS_SECRET_KEY}:`);
    const confirmRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodedSecret}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const result = await confirmRes.json();
    return json(result, confirmRes.status);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : '알 수 없는 오류' }, 500);
  }
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

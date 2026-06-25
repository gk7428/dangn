export type Product = {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  price: string;
  likes: number;
  color: string;
  description: string;
  photoUri?: string;
  requiredTier?: 'free' | 'paid';
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    title: '아이폰 15 프로 블랙 256GB',
    location: '마포구 합정동',
    timeAgo: '1분 전',
    price: '1,200,000원',
    likes: 5,
    color: '#D0D0D0',
    description: '구매한 지 3개월 된 아이폰 15 프로입니다. 케이스 끼고 사용해서 외관 스크래치 없습니다. 배터리 성능 97% 이상이며 정품 박스 및 충전기 포함입니다. 직거래 원하시면 합정역 근처에서 가능합니다.',
  },
  {
    id: '2',
    title: '나이키 에어포스 1 270mm 새상품',
    location: '마포구 망원동',
    timeAgo: '13분 전',
    price: '95,000원',
    likes: 12,
    color: '#C8E6C9',
    description: '선물받은 나이키 에어포스 1 화이트입니다. 제 발 사이즈가 맞지 않아 판매합니다. 한 번도 신지 않은 새상품이며 정품 박스 있습니다. 270mm 사이즈입니다.',
  },
  {
    id: '3',
    title: '원목 4인 식탁 의자 포함',
    location: '서대문구 연희동',
    timeAgo: '30분 전',
    price: '180,000원',
    likes: 3,
    color: '#FFE0B2',
    description: '이사로 인해 판매합니다. 원목 소재 4인 식탁으로 의자 4개 포함입니다. 사용 기간 2년이며 흠집 거의 없이 깨끗합니다. 직거래만 가능하며 운반은 구매자 부담입니다.',
  },
  {
    id: '4',
    title: '다이슨 에어랩 컴플리트',
    location: '마포구 서교동',
    timeAgo: '1시간 전',
    price: '450,000원',
    likes: 28,
    color: '#F8BBD9',
    description: '다이슨 에어랩 컴플리트 풀셋입니다. 6개월 사용했으며 모든 부속품 포함입니다. 정품 파우치와 박스 있습니다. 구입가 75만원, 급하게 판매합니다.',
  },
  {
    id: '5',
    title: '자전거 삼천리 레전드 7단',
    location: '은평구 녹번동',
    timeAgo: '2시간 전',
    price: '120,000원',
    likes: 7,
    color: '#BBDEFB',
    description: '삼천리 레전드 7단 자전거입니다. 1년 사용했으며 타이어 작년에 교체했습니다. 기어 변속 잘 됩니다. 앞 바구니 달려있습니다. 직거래만 가능합니다.',
  },
  {
    id: '6',
    title: '스타벅스 텀블러 473ml 미개봉',
    location: '마포구 공덕동',
    timeAgo: '3시간 전',
    price: '25,000원',
    likes: 2,
    color: '#C8E6C9',
    description: '스타벅스 한정판 텀블러 473ml입니다. 선물받았는데 이미 같은 제품이 있어서 판매합니다. 비닐 뜯지 않은 완전 미개봉 새상품입니다.',
  },
  {
    id: '7',
    title: '닌텐도 스위치 OLED + 게임 3개',
    location: '용산구 한남동',
    timeAgo: '5시간 전',
    price: '380,000원',
    likes: 19,
    color: '#F3E5F5',
    description: '닌텐도 스위치 OLED 화이트 모델입니다. 게임 3개(마리오카트8, 모여봐요 동물의 숲, 젤다의 전설) 포함입니다. 화면 기스 없고 독 포함 풀 구성입니다.',
  },
  {
    id: '8',
    title: '맥북 프로 14인치 M3 스페이스 블랙',
    location: '마포구 상암동',
    timeAgo: '어제',
    price: '2,800,000원',
    likes: 33,
    color: '#ECEFF1',
    description: '맥북 프로 14인치 M3 칩 스페이스 블랙 모델입니다. 구매 후 6개월 사용했으며 외관 스크래치 없이 깨끗합니다. 애플케어+ 2년 남았습니다. 정품 충전기 포함.',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

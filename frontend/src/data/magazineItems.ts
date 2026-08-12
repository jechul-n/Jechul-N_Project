import abaloneImage from "../assets/figma/home-raw-4.png";
import peachImage from "../assets/figma/home-raw-1.png";
import watermelonImage from "../assets/figma/home-raw-3.png";

export interface MagazineItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

export const magazineItems: MagazineItem[] = [
  {
    id: "seasonal-abalone-guide",
    image: abaloneImage,
    title: "전복 손질법",
    description: "8월의 통통한 전복! 이렇게 손질해요",
  },
  {
    id: "watermelon-guide",
    image: watermelonImage,
    title: "맛있는 수박 구별법",
    description: "이 부분을 자세히 살펴봐요",
  },
  {
    id: "peach-guide",
    image: peachImage,
    title: "2주의 마법",
    description: "대극천 복숭아는 2주면 사라진다는 사실",
  },
];

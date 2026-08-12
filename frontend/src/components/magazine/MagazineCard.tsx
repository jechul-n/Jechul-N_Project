import type { MagazineItem } from "../../data/magazineItems";

interface MagazineCardProps {
  item: MagazineItem;
}

function MagazineCard({ item }: MagazineCardProps) {
  return (
    <article className="magazine-card">
      <img className="magazine-card__image" src={item.image} alt="" />
      <div className="magazine-card__content">
        <h3 className="magazine-card__title">{item.title}</h3>
        <p className="magazine-card__description">{item.description}</p>
      </div>
    </article>
  );
}

export default MagazineCard;

import React from "react";
import { Category } from "../utils/storage";
import {
  FaUtensils,
  FaBus,
  FaFilm,
  FaShoppingCart,
  FaHotel,
  FaQuestion,
} from "react-icons/fa";

interface CategoryIconProps {
  category: Category;
  color?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  color = "#F7DC6F",
}) => {
  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case Category.FOOD:
        return <FaUtensils style={{ color: color }} />;
      case Category.TRANSPORTATION:
        return <FaBus style={{ color: color }} />;
      case Category.ENTERTAINMENT:
        return <FaFilm style={{ color: color }} />;
      case Category.SHOPPING:
        return <FaShoppingCart style={{ color: color }} />;
      case Category.ACCOMMODATION:
        return <FaHotel style={{ color: color }} />;
      case Category.OTHER:
      default:
        return <FaQuestion style={{ color: color }} />;
    }
  };
  if (!category || category === Category.OTHER) {
    return (
      <div
        className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
        style={{
          backgroundColor: color,
        }}
      ></div>
    );
  }

  return <div className="text-xl mr-3">{getCategoryIcon(category)}</div>;
};

export default CategoryIcon;

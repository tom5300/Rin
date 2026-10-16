import { Link, useLocation } from "wouter";
import { useMenuItems } from "../menu-options";

export function NavBar({
  menu,
  onClick,
  itemClassName = "",
}: {
  menu: boolean;
  onClick?: () => void;
  itemClassName?: string;
}) {
  const [location] = useLocation();
  const items = useMenuItems();

  return (
    <>
      {items
        .filter((item) => item.visible)
        .map((item) => (
          <NavItem
            key={`${item.href}-${item.label}`}
            menu={menu}
            onClick={onClick}
            itemClassName={itemClassName}
            title={item.label}
            selected={isHrefSelected(location, item.href)}
            href={item.href}
          />
        ))}
    </>
  );
}

function isHrefSelected(location: string, href: string) {
  if (href === "/") {
    return location === "/" || location.startsWith("/feed");
  }
  return location === href || location.startsWith(`${href}/`);
}

function NavItem({
  menu,
  title,
  selected,
  href,
  when = true,
  onClick,
  itemClassName = "",
}: {
  title: string;
  selected: boolean;
  href: string;
  menu?: boolean;
  when?: boolean;
  onClick?: () => void;
  itemClassName?: string;
}) {
  return when ? (
    <Link
      href={href}
      className={`${menu ? "" : "hidden"} md:block cursor-pointer hover:text-theme duration-300 px-2 py-4 md:p-4 text-sm ${
        selected ? "text-theme" : "dark:text-white"
      } ${itemClassName}`}
      state={{ animate: true }}
      onClick={onClick}
    >
      {title}
    </Link>
  ) : null;
}

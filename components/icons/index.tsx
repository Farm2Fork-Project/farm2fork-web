import type { SVGProps } from "react";
import { iconArt, type IconArt, type IconName } from "./art";

export type { IconName } from "./art";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  /** Pixel size, or any CSS length. Defaults to 1em so the icon follows the font size. */
  size?: number | string;
  strokeWidth?: number;
}

const TINT_OFFSET = 1.1;

function createIcon(name: string, art: IconArt) {
  function Icon({ size = "1em", strokeWidth = 1.75, className, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={className ? `f2f-icon ${className}` : "f2f-icon"}
        {...rest}
      >
        {art.tint ? (
          <g className="f2f-icon-tint" transform={`translate(${TINT_OFFSET} ${TINT_OFFSET})`} fill="currentColor" fillOpacity={0.16} stroke="none">
            {art.tint.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        ) : null}
        {art.line.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  }
  Icon.displayName = `Ic${name[0].toUpperCase()}${name.slice(1)}`;
  return Icon;
}

/** Render any icon by name, e.g. `<Icon name="truck" size={20} />`. */
export function Icon({ name, ...props }: IconProps & { name: IconName }) {
  const Component = icons[name];
  return <Component {...props} />;
}

const build = <K extends IconName>(name: K) => createIcon(name, iconArt[name]);

export const IcLeaf = build("leaf");
export const IcSprout = build("sprout");
export const IcWheat = build("wheat");
export const IcRice = build("rice");
export const IcMango = build("mango");
export const IcMaize = build("maize");
export const IcCotton = build("cotton");
export const IcSugarcane = build("sugarcane");
export const IcCarrot = build("carrot");
export const IcMilk = build("milk");
export const IcTractor = build("tractor");
export const IcTruck = build("truck");
export const IcMapPin = build("mapPin");
export const IcPackage = build("package");
export const IcShield = build("shield");
export const IcBadgeCheck = build("badgeCheck");
export const IcQr = build("qr");
export const IcScan = build("scan");
export const IcGlobe = build("globe");
export const IcStore = build("store");
export const IcCart = build("cart");
export const IcCrate = build("crate");
export const IcBag = build("bag");
export const IcCard = build("card");
export const IcCoin = build("coin");
export const IcTag = build("tag");
export const IcArrowLeft = build("arrowLeft");
export const IcArrowRight = build("arrowRight");
export const IcChevronRight = build("chevronRight");
export const IcCheck = build("check");
export const IcCheckCircle = build("checkCircle");
export const IcPlus = build("plus");
export const IcPlusCircle = build("plusCircle");
export const IcClose = build("close");
export const IcMenu = build("menu");
export const IcSearch = build("search");
export const IcInfo = build("info");
export const IcHelp = build("help");
export const IcAlert = build("alert");
export const IcLock = build("lock");
export const IcEye = build("eye");
export const IcEyeOff = build("eyeOff");
export const IcBell = build("bell");
export const IcUser = build("user");
export const IcUsers = build("users");
export const IcLogOut = build("logOut");
export const IcMessage = build("message");
export const IcClipboard = build("clipboard");
export const IcFile = build("file");
export const IcHeart = build("heart");
export const IcStar = build("star");
export const IcSparkles = build("sparkles");
export const IcSend = build("send");
export const IcFeed = build("feed");
export const IcEdit = build("edit");
export const IcTrash = build("trash");
export const IcGrid = build("grid");
export const IcCamera = build("camera");
export const IcMail = build("mail");

const icons = {
  leaf: IcLeaf, sprout: IcSprout, wheat: IcWheat, rice: IcRice, mango: IcMango, maize: IcMaize,
  cotton: IcCotton, sugarcane: IcSugarcane, carrot: IcCarrot, milk: IcMilk, tractor: IcTractor,
  truck: IcTruck, mapPin: IcMapPin, package: IcPackage, shield: IcShield, badgeCheck: IcBadgeCheck,
  qr: IcQr, scan: IcScan, globe: IcGlobe, store: IcStore, cart: IcCart, crate: IcCrate, bag: IcBag,
  card: IcCard, coin: IcCoin, tag: IcTag, arrowLeft: IcArrowLeft, arrowRight: IcArrowRight,
  chevronRight: IcChevronRight, check: IcCheck, checkCircle: IcCheckCircle, plus: IcPlus,
  plusCircle: IcPlusCircle, close: IcClose, menu: IcMenu, search: IcSearch, info: IcInfo,
  help: IcHelp, alert: IcAlert, lock: IcLock, eye: IcEye, eyeOff: IcEyeOff, bell: IcBell,
  user: IcUser, users: IcUsers, logOut: IcLogOut, message: IcMessage, clipboard: IcClipboard,
  file: IcFile, heart: IcHeart, star: IcStar, sparkles: IcSparkles, send: IcSend, feed: IcFeed,
  edit: IcEdit, trash: IcTrash, grid: IcGrid, camera: IcCamera, mail: IcMail,
} satisfies Record<IconName, ReturnType<typeof createIcon>>;

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: string;
  items?: NavItem[];
  disabled?: boolean;
  external?: boolean;
  roles?: string[];
}

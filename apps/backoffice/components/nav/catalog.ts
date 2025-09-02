import { Activity, ArrowLeftRight, Banknote, BarChart2, Barcode, Bell, Boxes, Calculator, CalendarDays, Circle, CircleSlash, ClipboardCheck, ClipboardList, Clock, CloudUpload, Coins, CreditCard, Database, Download, FileCheck, FileCog, FileEdit, FileSearch, FileText, FileX, Fingerprint, Flag, FlaskConical, Gift, Globe, HardDrive, Heart, History, IdCard, KeyRound, Layers, LineChart, ListChecks, MapPin, Megaphone, MessageSquare, Monitor, Package, Percent, ReceiptText, RefreshCw, RotateCcw, Ruler, Scale, Search, Server, Settings, Shield, ShieldAlert, ShieldCheck, ShoppingCart, SlidersHorizontal, SplitSquareVertical, Star, Store, Tag, Tags, Ticket, Truck, Upload, User, Users2 } from 'lucide-react'

export type NavItem = { href: string; label: string; icon?: keyof typeof IconMap }
export type NavGroup = { title: string; key: string; items: NavItem[] }

export const groups: NavGroup[] = [
    {
        "title":  "Admin \u0026 Security",
        "key":  "admin",
        "items":  [
                      {
                          "href":  "/admin/users",
                          "label":  "Users",
                          "icon":  "users"
                      },
                      {
                          "href":  "/admin/roles-rights",
                          "label":  "Roles \u0026 Rights",
                          "icon":  "shield"
                      },
                      {
                          "href":  "/admin/licenses",
                          "label":  "Licenses",
                          "icon":  "fileCog"
                      },
                      {
                          "href":  "/admin/system-logs",
                          "label":  "System Logs",
                          "icon":  "settings"
                      },
                      {
                          "href":  "/admin/change-logs",
                          "label":  "Change Data Logs",
                          "icon":  "fileEdit"
                      },
                      {
                          "href":  "/admin/feature-flags",
                          "label":  "Feature Flags",
                          "icon":  "flag"
                      },
                      {
                          "href":  "/admin/api-keys",
                          "label":  "API Keys",
                          "icon":  "key"
                      },
                      {
                          "href":  "/admin/sessions",
                          "label":  "Sessions",
                          "icon":  "clock"
                      },
                      {
                          "href":  "/admin/sso",
                          "label":  "SSO",
                          "icon":  "globe"
                      },
                      {
                          "href":  "/admin/mfa",
                          "label":  "MFA",
                          "icon":  "fingerprint"
                      }
                  ]
    },
    {
        "title":  "Master Data",
        "key":  "master",
        "items":  [
                      {
                          "href":  "/master/items",
                          "label":  "Items",
                          "icon":  "boxes"
                      },
                      {
                          "href":  "/master/categories",
                          "label":  "Categories",
                          "icon":  "layers"
                      },
                      {
                          "href":  "/master/brands",
                          "label":  "Brands",
                          "icon":  "tag"
                      },
                      {
                          "href":  "/master/attributes",
                          "label":  "Attributes",
                          "icon":  "sliders"
                      },
                      {
                          "href":  "/master/uom",
                          "label":  "Units of Measure",
                          "icon":  "ruler"
                      },
                      {
                          "href":  "/master/tax-rates",
                          "label":  "Tax Rates",
                          "icon":  "percent"
                      },
                      {
                          "href":  "/master/reason-codes",
                          "label":  "Reason Codes",
                          "icon":  "list"
                      },
                      {
                          "href":  "/master/locations",
                          "label":  "Locations",
                          "icon":  "mapPin"
                      },
                      {
                          "href":  "/master/pack-sizes",
                          "label":  "Pack Sizes",
                          "icon":  "package"
                      },
                      {
                          "href":  "/master/barcode-rules",
                          "label":  "Barcode Rules",
                          "icon":  "barcode"
                      }
                  ]
    },
    {
        "title":  "Suppliers",
        "key":  "suppliers",
        "items":  [
                      {
                          "href":  "/suppliers/list",
                          "label":  "Supplier Directory",
                          "icon":  "factory"
                      },
                      {
                          "href":  "/suppliers/contacts",
                          "label":  "Supplier Contacts",
                          "icon":  "users"
                      },
                      {
                          "href":  "/suppliers/items",
                          "label":  "Supplier Items",
                          "icon":  "boxes"
                      },
                      {
                          "href":  "/suppliers/terms",
                          "label":  "Payment/Trade Terms",
                          "icon":  "fileText"
                      },
                      {
                          "href":  "/suppliers/lead-times",
                          "label":  "Lead Times",
                          "icon":  "clock"
                      },
                      {
                          "href":  "/suppliers/contracts",
                          "label":  "Contract Pricing",
                          "icon":  "fileCog"
                      },
                      {
                          "href":  "/suppliers/performance",
                          "label":  "Performance Scorecards",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/suppliers/claims",
                          "label":  "Claims / Chargebacks",
                          "icon":  "fileX"
                      },
                      {
                          "href":  "/suppliers/returns-rtv",
                          "label":  "Returns to Vendor (RTV)",
                          "icon":  "truck"
                      },
                      {
                          "href":  "/suppliers/credit-notes",
                          "label":  "Credit Notes",
                          "icon":  "fileCheck"
                      }
                  ]
    },
    {
        "title":  "Pricing \u0026 Promotions",
        "key":  "pricing",
        "items":  [
                      {
                          "href":  "/pricing/price-lists",
                          "label":  "Price Lists",
                          "icon":  "tags"
                      },
                      {
                          "href":  "/pricing/store-prices",
                          "label":  "Store Prices",
                          "icon":  "tags"
                      },
                      {
                          "href":  "/pricing/overrides",
                          "label":  "Overrides (Effective Dates)",
                          "icon":  "fileEdit"
                      },
                      {
                          "href":  "/pricing/markdowns",
                          "label":  "Markdowns / Reduce to Clear",
                          "icon":  "percent"
                      },
                      {
                          "href":  "/pricing/promotions",
                          "label":  "Promotions",
                          "icon":  "gift"
                      },
                      {
                          "href":  "/pricing/coupons",
                          "label":  "Coupons / Vouchers",
                          "icon":  "ticket"
                      },
                      {
                          "href":  "/pricing/bundles-bogo",
                          "label":  "Bundles / BOGO",
                          "icon":  "package"
                      },
                      {
                          "href":  "/pricing/competitor-prices",
                          "label":  "Competitor Prices",
                          "icon":  "search"
                      },
                      {
                          "href":  "/pricing/import",
                          "label":  "Price Import (CSV)",
                          "icon":  "upload"
                      },
                      {
                          "href":  "/pricing/export",
                          "label":  "Price Export",
                          "icon":  "download"
                      }
                  ]
    },
    {
        "title":  "Procurement (PO)",
        "key":  "po",
        "items":  [
                      {
                          "href":  "/po/rfqs",
                          "label":  "RFQs",
                          "icon":  "fileText"
                      },
                      {
                          "href":  "/po/purchase-orders",
                          "label":  "Purchase Orders",
                          "icon":  "clipboard"
                      },
                      {
                          "href":  "/po/approvals",
                          "label":  "PO Approvals",
                          "icon":  "shieldCheck"
                      },
                      {
                          "href":  "/po/asn",
                          "label":  "Advance Ship Notices (ASN)",
                          "icon":  "truck"
                      },
                      {
                          "href":  "/po/receiving",
                          "label":  "Receiving",
                          "icon":  "clipboardCheck"
                      },
                      {
                          "href":  "/po/three-way-match",
                          "label":  "3-Way Match",
                          "icon":  "fileSearch"
                      },
                      {
                          "href":  "/po/invoices",
                          "label":  "Supplier Invoices",
                          "icon":  "receipt"
                      },
                      {
                          "href":  "/po/credit-notes",
                          "label":  "Credit Notes",
                          "icon":  "fileCheck"
                      },
                      {
                          "href":  "/po/claims",
                          "label":  "Claims",
                          "icon":  "fileX"
                      },
                      {
                          "href":  "/po/returns",
                          "label":  "PO Returns",
                          "icon":  "truck"
                      }
                  ]
    },
    {
        "title":  "Inventory \u0026 Warehouse",
        "key":  "inventory",
        "items":  [
                      {
                          "href":  "/inventory/on-hand",
                          "label":  "On-hand Inventory",
                          "icon":  "boxes"
                      },
                      {
                          "href":  "/inventory/adjustments",
                          "label":  "Adjustments",
                          "icon":  "clipboard"
                      },
                      {
                          "href":  "/inventory/transfers",
                          "label":  "Transfers",
                          "icon":  "arrows"
                      },
                      {
                          "href":  "/inventory/cycle-counts",
                          "label":  "Cycle Counts",
                          "icon":  "clipboardCheck"
                      },
                      {
                          "href":  "/inventory/replenishment",
                          "label":  "Replenishment",
                          "icon":  "truck"
                      },
                      {
                          "href":  "/inventory/bin-locations",
                          "label":  "Bin Locations",
                          "icon":  "mapPin"
                      },
                      {
                          "href":  "/inventory/batches-lots",
                          "label":  "Batches / Lots",
                          "icon":  "flask"
                      },
                      {
                          "href":  "/inventory/expiries-fefo",
                          "label":  "Expiries (FEFO)",
                          "icon":  "calendar"
                      },
                      {
                          "href":  "/inventory/serial-numbers",
                          "label":  "Serial Numbers",
                          "icon":  "barcode"
                      },
                      {
                          "href":  "/inventory/stock-valuation",
                          "label":  "Stock Valuation",
                          "icon":  "scale"
                      }
                  ]
    },
    {
        "title":  "POS \u0026 Sales",
        "key":  "pos",
        "items":  [
                      {
                          "href":  "/pos/terminal-config",
                          "label":  "Terminal Config",
                          "icon":  "monitor"
                      },
                      {
                          "href":  "/pos/tenders",
                          "label":  "Tenders",
                          "icon":  "card"
                      },
                      {
                          "href":  "/pos/receipts",
                          "label":  "Receipts",
                          "icon":  "receipt"
                      },
                      {
                          "href":  "/pos/returns",
                          "label":  "Returns",
                          "icon":  "rotate"
                      },
                      {
                          "href":  "/pos/hold-resume",
                          "label":  "Hold / Resume",
                          "icon":  "split"
                      },
                      {
                          "href":  "/pos/discounts",
                          "label":  "Discounts",
                          "icon":  "percent"
                      },
                      {
                          "href":  "/pos/drawer",
                          "label":  "Cash Drawer",
                          "icon":  "package"
                      },
                      {
                          "href":  "/pos/sales-history",
                          "label":  "Sales History",
                          "icon":  "history"
                      },
                      {
                          "href":  "/pos/shift-management",
                          "label":  "Shift Management",
                          "icon":  "clock"
                      },
                      {
                          "href":  "/pos/end-of-day",
                          "label":  "End of Day (Z)",
                          "icon":  "calendar"
                      }
                  ]
    },
    {
        "title":  "Customers \u0026 Loyalty",
        "key":  "crm",
        "items":  [
                      {
                          "href":  "/crm/customers",
                          "label":  "Customers",
                          "icon":  "user"
                      },
                      {
                          "href":  "/crm/segments",
                          "label":  "Segments",
                          "icon":  "layers"
                      },
                      {
                          "href":  "/crm/loyalty-points",
                          "label":  "Loyalty Points",
                          "icon":  "heart"
                      },
                      {
                          "href":  "/crm/tiers",
                          "label":  "Tiers",
                          "icon":  "star"
                      },
                      {
                          "href":  "/crm/vouchers",
                          "label":  "Vouchers",
                          "icon":  "ticket"
                      },
                      {
                          "href":  "/crm/memberships",
                          "label":  "Memberships",
                          "icon":  "id"
                      },
                      {
                          "href":  "/crm/preferences",
                          "label":  "Communication Prefs",
                          "icon":  "bell"
                      },
                      {
                          "href":  "/crm/campaigns",
                          "label":  "Campaigns",
                          "icon":  "megaphone"
                      },
                      {
                          "href":  "/crm/cases",
                          "label":  "Cases / Tickets",
                          "icon":  "message"
                      }
                  ]
    },
    {
        "title":  "E-commerce \u0026 Orders",
        "key":  "orders",
        "items":  [
                      {
                          "href":  "/orders/web-orders",
                          "label":  "Web Orders",
                          "icon":  "cart"
                      },
                      {
                          "href":  "/orders/click-collect",
                          "label":  "Click \u0026 Collect",
                          "icon":  "store"
                      },
                      {
                          "href":  "/orders/delivery-slots",
                          "label":  "Delivery Slots",
                          "icon":  "calendar"
                      },
                      {
                          "href":  "/orders/statuses",
                          "label":  "Order Statuses",
                          "icon":  "list"
                      },
                      {
                          "href":  "/orders/fraud-checks",
                          "label":  "Fraud Checks",
                          "icon":  "shield"
                      },
                      {
                          "href":  "/orders/cancellations",
                          "label":  "Cancellations",
                          "icon":  "circleSlash"
                      },
                      {
                          "href":  "/orders/backorders",
                          "label":  "Backorders",
                          "icon":  "clock"
                      },
                      {
                          "href":  "/orders/special-orders",
                          "label":  "Special Orders",
                          "icon":  "cart"
                      },
                      {
                          "href":  "/orders/quotes",
                          "label":  "Quotes",
                          "icon":  "fileText"
                      }
                  ]
    },
    {
        "title":  "Finance \u0026 Tax",
        "key":  "finance",
        "items":  [
                      {
                          "href":  "/finance/taxes",
                          "label":  "Taxes (VAT/GST)",
                          "icon":  "percent"
                      },
                      {
                          "href":  "/finance/fiscal-periods",
                          "label":  "Fiscal Periods",
                          "icon":  "calendar"
                      },
                      {
                          "href":  "/finance/gl-export",
                          "label":  "GL Export",
                          "icon":  "fileText"
                      },
                      {
                          "href":  "/finance/paid-outs",
                          "label":  "Paid Outs",
                          "icon":  "banknote"
                      },
                      {
                          "href":  "/finance/reconciliation",
                          "label":  "Reconciliation",
                          "icon":  "scale"
                      },
                      {
                          "href":  "/finance/currency-fx",
                          "label":  "Currency \u0026 FX",
                          "icon":  "coins"
                      },
                      {
                          "href":  "/finance/cogs",
                          "label":  "COGS",
                          "icon":  "calculator"
                      },
                      {
                          "href":  "/finance/margin-analysis",
                          "label":  "Margin Analysis",
                          "icon":  "barChart"
                      }
                  ]
    },
    {
        "title":  "EDI \u0026 Integrations",
        "key":  "integrations",
        "items":  [
                      {
                          "href":  "/integrations/edi-850-pos",
                          "label":  "EDI 850 (PO)",
                          "icon":  "fileText"
                      },
                      {
                          "href":  "/integrations/edi-855-ack",
                          "label":  "EDI 855 (Ack)",
                          "icon":  "fileText"
                      },
                      {
                          "href":  "/integrations/edi-856-asn",
                          "label":  "EDI 856 (ASN)",
                          "icon":  "truck"
                      },
                      {
                          "href":  "/integrations/edi-810-invoice",
                          "label":  "EDI 810 (Invoice)",
                          "icon":  "receipt"
                      },
                      {
                          "href":  "/integrations/erp-connector",
                          "label":  "ERP Connector",
                          "icon":  "server"
                      },
                      {
                          "href":  "/integrations/sftp-jobs",
                          "label":  "SFTP Jobs",
                          "icon":  "cloudUp"
                      }
                  ]
    },
    {
        "title":  "Reporting \u0026 Analytics",
        "key":  "reports",
        "items":  [
                      {
                          "href":  "/reports/sales-by-store",
                          "label":  "Sales by Store",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/sales-by-category",
                          "label":  "Sales by Category",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/inventory-aging",
                          "label":  "Inventory Aging",
                          "icon":  "lineChart"
                      },
                      {
                          "href":  "/reports/stock-turns",
                          "label":  "Stock Turns",
                          "icon":  "lineChart"
                      },
                      {
                          "href":  "/reports/gmroi",
                          "label":  "GMROI",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/purchase-variance",
                          "label":  "Purchase Variance",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/supplier-scorecards",
                          "label":  "Supplier Scorecards",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/promo-uplift",
                          "label":  "Promotion Uplift",
                          "icon":  "barChart"
                      },
                      {
                          "href":  "/reports/scheduled",
                          "label":  "Scheduled Reports",
                          "icon":  "calendar"
                      }
                  ]
    },
    {
        "title":  "Operations \u0026 Admin",
        "key":  "ops",
        "items":  [
                      {
                          "href":  "/ops/health",
                          "label":  "Health / Status",
                          "icon":  "activity"
                      },
                      {
                          "href":  "/ops/backups",
                          "label":  "Backups",
                          "icon":  "hardDrive"
                      },
                      {
                          "href":  "/ops/migrations",
                          "label":  "DB Migrations",
                          "icon":  "database"
                      },
                      {
                          "href":  "/ops/env-config",
                          "label":  "Environment Config",
                          "icon":  "fileCog"
                      },
                      {
                          "href":  "/ops/data-purge",
                          "label":  "Data Purge",
                          "icon":  "fileX"
                      },
                      {
                          "href":  "/ops/sandbox-clone",
                          "label":  "Sandbox Clone",
                          "icon":  "refresh"
                      },
                      {
                          "href":  "/ops/gdpr-requests",
                          "label":  "GDPR / SAR",
                          "icon":  "shieldAlert"
                      },
                      {
                          "href":  "/ops/audit-exports",
                          "label":  "Audit Exports",
                          "icon":  "fileSearch"
                      },
                      {
                          "href":  "/ops/observability",
                          "label":  "Observability",
                          "icon":  "activity"
                      }
                  ]
    }
]

export const IconMap = {  } as const
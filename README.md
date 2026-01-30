# Trader - Astro + React + Zustand

Dự án trading dashboard mobile được xây dựng với Astro, React và Zustand để quản lý state.

## Công nghệ sử dụng

- **Astro**: Framework để xây dựng ứng dụng web (Layout)
- **React**: UI library cho tất cả các components tương tác
- **Zustand**: State management library nhẹ và đơn giản
- **Tailwind CSS**: Utility-first CSS framework

## Cài đặt

```bash
npm install
```

## Chạy dự án

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:4321`

## Build

```bash
npm run build
```

## Cấu trúc dự án

```
src/
├── components/          # React components (tất cả đều là React)
│   ├── Header.tsx              # Header với user icon và language icon
│   ├── HeroBanner.tsx          # Banner chính "CAREFULLY SELECTED FOR YOU"
│   ├── ServiceIcons.tsx        # 5 service icons (Service, Verified, Recharge, etc.)
│   ├── MarketCard.tsx          # Component cho từng market card
│   ├── MarketCards.tsx         # Horizontal scrollable market cards
│   ├── AssetListItem.tsx       # Component cho từng asset item trong list
│   ├── AssetListTab.tsx        # Tab USDT/Derivatives với asset list
│   ├── FooterNav.tsx           # Bottom navigation với 5 tabs
│   ├── TradingDashboard.tsx    # Dashboard cũ (có thể dùng sau)
│   └── TradingPanel.tsx        # Trading panel cũ (có thể dùng sau)
├── layouts/            # Astro layouts
│   └── Layout.astro    # Layout tổng với Header và Footer
├── pages/              # Astro pages
│   └── index.astro    # Trang chủ mobile
└── stores/             # Zustand stores
    └── tradingStore.ts # Store quản lý trading state
```

## Tính năng Mobile UI

- ✅ **Header**: User icon bên trái, Language selector bên phải
- ✅ **Hero Banner**: Banner "CAREFULLY SELECTED FOR YOU" với Bitcoin logo và decorative elements
- ✅ **Service Icons**: 5 service icons (Service, Verified, Recharge, Regulatory Information, Loan)
- ✅ **Market Cards**: Horizontal scrollable cards hiển thị giá crypto với mini charts
- ✅ **Asset List**: Tab USDT/Derivatives với danh sách assets và giá
- ✅ **Footer Navigation**: Bottom nav với 5 tabs (Home, Coins, Contract, Finance, Mine)
- ✅ **Mobile-first Design**: Tối ưu cho mobile screen
- ✅ **Dark Theme**: Giao diện tối với accent màu xanh lá

## Component Structure

Tất cả components được tách riêng thành từng file:
- Mỗi component có trách nhiệm riêng
- Dễ dàng maintain và mở rộng
- Layout.astro chứa Header và Footer
- Các components khác đều là React với `client:load`

## Phát triển thêm

Bạn có thể mở rộng dự án với:
- Kết nối API thực tế để lấy giá crypto
- WebSocket để cập nhật giá real-time
- Chart library (như TradingView) để hiển thị biểu đồ giá
- Authentication và user management
- Lịch sử giao dịch chi tiết
- Risk management tools
- Push notifications
- PWA support

# System Wireframe: Igan's Budbod House

Ang file na ito ay naglalarawan ng layout, structure, at flow ng system para sa Admin at Customer side.

---

## 1. Customer/Client Side

### **A. QR Verification / Entry (`verify.html`)**
```text
+------------------------------------------+
|            🔥 Igan's Logo                |
|        [ LOCATION VERIFICATION ]          |
|                                          |
|             [ VERIFY BTN ]               |
|                                          |
| (Redirects to Order Type after success)  |
+------------------------------------------+
```

### **B. Order Type Page (`order-type.html`)**
```text
+------------------------------------------+
|            Welcome!                      |
|   How would you like to enjoy your meal? |
|                                          |
|  [ Dine In Card ]    [ Take Out Card ]   |
|                                          |
|           [ BROWSE MENU BTN ]            |
+------------------------------------------+
```

### **C. Menu Page (`menu.html`)**
```text
+------------------------------------------+
| [🔥 LOGO]   [🔍 Search...]   [🛒 Cart(0)]|
+------------------------------------------+
| [All] [Main Course] [Drinks] [Desserts]  | <--- Category Pills
+------------------------------------------+
|  [ BANNER: Featured / Best Seller ]      |
+------------------------------------------+
|  [Dish Image]      |  [Dish Image]       |
|  Name: Adobo       |  Name: Sinigang     |
|  Price: P150       |  Price: P180        |
|  [+ ADD TO CART]   |  [+ ADD TO CART]    |
+------------------------------------------+
| [🤖 AI Chat Toggle]                      |
+------------------------------------------+
```

### **D. Cart / Checkout (`cart.html`)**
```text
+------------------------------------------+
| [← BACK TO MENU]         [User Profile]  |
+------------------------------------------+
|  ORDER ITEMS                             |
|  - Dish 1  [ - 1 + ]  P150  [🗑]         |
|  - Dish 2  [ - 2 + ]  P360  [🗑]         |
|                                          |
|  [ Special Requests Textarea ]           |
+------------------------------------------+
|  ORDER SUMMARY                           |
|  Subtotal: P510                          |
|  VAT (12%): P61.2                        |
|  TOTAL: P571.2                           |
|  [ ✅ PLACE ORDER BTN ]                  |
+------------------------------------------+
```

### **E. Order Status (`order-status.html`)**
```text
+------------------------------------------+
| [🔥 LOGO]                [User Profile]  |
+------------------------------------------+
|       ORDER #1001 STATUS: PREPARING      |
|                                          |
|  (Pending)---(Preparing)---(Ready)---(Served) |
|      [v]         [!]         [ ]       [ ]    |
|                                          |
|      Estimated Time: 15-20 mins          |
+------------------------------------------+
```

---

## 2. Admin Side (`admin/`)

### **A. Shell / Sidebar Layout**
Lahat ng admin pages ay sumusunod sa layout na ito:
```text
+---------+--------------------------------+
| SIDEBAR |           TOPBAR               |
| [Logo]  | [☰] Dashboard      [User Profile]|
|         +--------------------------------+
| Dashboard|                                |
| Orders   |           MAIN CONTENT         |
| Menu     |                                |
| Users    |                                |
| Tables   |                                |
| Reports  |                                |
| Settings |                                |
+---------+--------------------------------+
```

### **B. Dashboard (`dashboard.html`)**
```text
+------------------------------------------+
| [ KPI 1 ] [ KPI 2 ] [ KPI 3 ] [ KPI 4 ]  |
| Today's Rev | Today's Ord | Customers    |
+------------------------------------------+
| [ Sales Chart ]      | [ Top Items ]     |
| (Line/Bar)           | (Doughnut)        |
+------------------------------------------+
| [ Recent Orders Table ]                  |
+------------------------------------------+
```

### **C. Menu Management (`menu-manage.html`)**
```text
+------------------------------------------+
| [ + ADD CATEGORY ]      [ + ADD ITEM ]   |
+------------------------------------------+
| [ All ] [ Category Filters... ]          |
+------------------------------------------+
| [Card: Image] [Card: Image] [Card: Image]|
| Name: Adobo   Name: Sisig   Name: Rice   |
| [ Edit ]      [ Edit ]      [ Edit ]     |
| [ Hide ]      [ Hide ]      [ Hide ]     |
+------------------------------------------+
```

### **D. Tables & QR (`tables.html`)**
```text
+------------------------------------------+
| [ PRINT ALL QR ]        [ + ADD TABLE ]  |
+------------------------------------------+
| [ QR Code ]  | [ QR Code ]  | [ QR Code ] |
| Table 1      | Table 2      | Table 3     |
| [ View ]     | [ View ]     | [ View ]    |
| [ Delete ]   | [ Delete ]   | [ Delete ]  |
+------------------------------------------+
```

---

## 3. Responsive Behavior (Mobile)
- **Sidebar**: Nagiging hidden at lumalabas lang kapag pinindot ang Hamburger Menu (☰).
- **KPI Cards**: Nag-iiba mula 5 columns patungong 1 column (stacking).
- **Tables**: Nagkakaroon ng horizontal scroll o nagiging "Card View" para sa maliit na screen.
- **Navbar**: Nag-stack ang logo at buttons para hindi mag-overlap.

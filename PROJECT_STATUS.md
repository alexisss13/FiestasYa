# PROJECT_STATUS.md

## 1. Funcionalidad Actual
### 🔐 Seguridad & Auth
- **NextAuth v5:** Login administrativo protegido.
- **Roles:** Sistema ADMIN/USER.

### 🛒 Tienda (Frontend)
- **Core:** Catálogo, Buscador, Categorías.
- **Carrito Pro:** Lógica pura separada (`cart-calculator.ts`) y estado con Zustand.
- **Cupones:** Descuentos fijos y porcentuales validados.
- **Checkout:** Integración WhatsApp con mensaje detallado.

### ⚙️ Administración (Backend)
- **CMS:** Gestión CRUD completa (Productos, Categorías, Banners, Configuración).
- **Pedidos:** Kanban de estados, control de stock y notificaciones Email.
- **Métricas:** Dashboard financiero y gráficos.

### 🛠️ Ingeniería & Calidad
- **Testing:** Unit Tests (Jest) para lógica financiera (100% cobertura).
- **Performance:** `unstable_cache` y `revalidateTag` para lecturas de DB optimizadas.
- **SEO Avanzado:** JSON-LD implementado dinámicamente en fichas de producto.

### 🎨 UX & Interfaz
- **Skeletons (Pantallas de Carga):**
  - Implementado sistema de carga progresiva con `loading.tsx`.
  - Componentes visuales (`ProductCardSkeleton`, `ProductDetailSkeleton`) que imitan el layout real.
  - Elimina el "layout shift" y mejora la percepción de velocidad.

## 2. Estructura Clave (Resumen)
src/
├── actions/            # Server Actions cacheados
├── app/
│   ├── (shop)/product/[slug]/page.tsx  # Con JSON-LD
├── lib/
│   ├── cart-calculator.ts # Cerebro matemático
│   └── prisma.ts       # Cliente Singleton
└── store/              # Zustand Store


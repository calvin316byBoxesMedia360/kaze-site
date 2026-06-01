# Diseño de la Interfaz: Espacio de Trabajo 2D Pattern y Sincronización en Tiempo Real

Este documento describe la especificación del nuevo flujo de trabajo e interfaz para el modo **2D Pattern** en MockupMKR.

---

## 🎯 Requisitos de Negocio e Interfaz

1.  **3D Studio Completo e Intacto**: La pestaña **3D Studio** (visor a pantalla completa con controles de iluminación, presets de fondos, OrbitControls y tiradores directos sobre el objeto 3D) funciona correctamente y no sufrirá ninguna modificación funcional o visual.
2.  **Lienzo Principal en 2D**: Al seleccionar **2D Pattern**, el visor 3D principal se reemplaza por un gran lienzo oscuro (`#111115`) que muestra los moldes bidimensionales a escala real de las piezas de la prenda:
    *   **Frente (Front)**
    *   **Espalda (Back)**
    *   **Manga Izquierda (L Sleeve)**
    *   **Manga Derecha (R Sleeve)**
    *(Nota: Se elimina por completo el dieline del Collar/Cuello, ya que no es necesario).*
3.  **Ventana Flotante 3D (PiP)**: En la esquina superior derecha del lienzo 2D se coloca una tarjeta flotante (`240px x 240px`) con bordes redondeados y sombra. Esta tarjeta contiene el visor 3D renderizando el modelo en tiempo real con el color de la camiseta y el diseño actualizado. El usuario puede orbitar la camiseta 3D directamente dentro de esta mini-ventana flotante.
4.  **Sincronización Total en Tiempo Real**: Ambas vistas comparten el mismo estado reactivo (`state.layers`). Mover, rotar o escalar una calcomanía en el lienzo 2D actualiza instantáneamente la posición 3D, y viceversa.
5.  **Paleta de Colores Exclusiva**: Se restringe el color de la camiseta a exactamente 8 opciones preestablecidas:
    *   Blanco (`#FFFFFF`)
    *   Negro (`#121212`)
    *   Azul Marino (`#0F2C59`)
    *   Verde Bosque (`#1C6758`)
    *   Amarillo (`#FFC26F`)
    *   Rojo (`#C82A2A`)
    *   Rosado (`#FF87B2`)
    *   Celeste (`#78C1F3`)

---

## 🛠️ Arquitectura y Flujo de Datos

### 1. Estado Reactivo Elevado (`App.tsx`)
Añadiremos `activeTab` como propiedad del estado global `MockupState` para permitir que `App.tsx` controle la renderización de la pantalla principal:
```typescript
export interface MockupState {
  // ... propiedades existentes
  activeTab: '3d' | '2d'
}
```

El flujo condicional en `App.tsx` para el visor principal será:
```typescript
<div className="viewer-container">
  {state.activeTab === '3d' ? (
    <MockupViewer
      state={state}
      onUpdate={update}
      onUpdateLayer={updateLayer}
      onExportReady={setExportFn}
    />
  ) : (
    <DielineWorkspace
      state={state}
      onUpdate={update}
      onUpdateLayer={updateLayer}
    />
  )}
</div>
```

### 2. Espacio de Trabajo 2D (`DielineWorkspace.tsx`)
Un nuevo componente que contiene:
*   Un contenedor flexible centrado para los moldes planos en 2D.
*   Renderización a gran escala de los SVG de las piezas Frente, Espalda, Manga Izq, Manga Der.
*   Áreas seguras (Safety Areas) y calcomanías renderizadas con tiradores a tamaño completo.
*   Un elemento flotante absolute-positioned en la esquina superior derecha que integra `<MockupViewer state={state} isMini={true} />`.

---

## 🎨 Aspecto Visual del Lienzo 2D

El lienzo de patronaje dispondrá las piezas en una composición clara:
*   **Izquierda**: Frente y Espalda alineados verticalmente o uno al lado del otro.
*   **Derecha**: Manga Izquierda y Manga Derecha apiladas verticalmente.
*   Todas las piezas serán de fondo blanco puro (`#FFFFFF`) con bordes suaves de costura, destacando de inmediato los diseños colocados.
*   Al seleccionar una pieza o hacer clic en ella, esta se ilumina con un contorno verde neón y se convierte en la región activa (`activeRegion`).

---

## 🧪 Plan de Verificación

### Pruebas Manuales
1.  **Interactividad 2D**: Seleccionar la pestaña 2D y arrastrar un logotipo sobre la silueta del Frente. Verificar que la ventana flotante 3D refleje el movimiento en tiempo real.
2.  **Sincronización de Pestañas**: Mover el logotipo en 2D, cambiar a la pestaña 3D y comprobar que el logotipo permanezca en la nueva posición. Moverlo en 3D, regresar a 2D y validar que se actualice la posición en el plano.
3.  **Color Picker de 8 Tonos**: Probar el selector de colores de la camiseta y confirmar que solo se permitan los 8 colores especificados.

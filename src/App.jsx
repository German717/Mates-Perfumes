import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  
  // Estados para los filtros y el orden
  const [filtro, setFiltro] = useState('Todos');
  const [subfiltro, setSubfiltro] = useState('Todas');
  const [orden, setOrden] = useState('defecto');

  useEffect(() => {
    // Agregamos el truco de la hora para evitar el caché
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS51PPN1Cs-k5L1palKnzOaNmkwS9F2qRXxyDHUchS9gLecU_Rhq6X6UYtZVT6F7oR9rypjosKV7RxI/pub?gid=572883000&single=true&output=csv&t=' + new Date().getTime();

    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      complete: (results) => {
        const datosLimpios = results.data.filter(
          (prod) => prod.ID && prod.Producto && prod.Producto.toString().trim() !== ''
        );
        setProductos(datosLimpios);
      },
      error: (err) => {
        console.error("Hubo un error leyendo la tabla:", err);
      }
    });
  }, []);

  // 1. Filtrar por Categoría Principal
  let productosFiltrados = productos.filter(prod => {
    if (filtro === 'Todos') return true;
    return prod.Categoria && prod.Categoria.toLowerCase().trim() === filtro.toLowerCase();
  });

  // Extraer subcategorías únicas de la categoría seleccionada
  const subcategoriasDisponibles = [...new Set(productosFiltrados
    .map(prod => prod.Subcategoria ? prod.Subcategoria.trim() : '')
    .filter(sub => sub !== '')
  )];

  // 2. Filtrar por Subcategoría (solo si no estamos en 'Todos' los productos)
  if (filtro !== 'Todos' && subfiltro !== 'Todas') {
    productosFiltrados = productosFiltrados.filter(prod => 
      prod.Subcategoria && prod.Subcategoria.trim() === subfiltro
    );
  }

  // 3. Ordenar por Precio
  if (orden === 'menor') {
    productosFiltrados.sort((a, b) => parseFloat(a.Precio_Final || 0) - parseFloat(b.Precio_Final || 0));
  } else if (orden === 'mayor') {
    productosFiltrados.sort((a, b) => parseFloat(b.Precio_Final || 0) - parseFloat(a.Precio_Final || 0));
  }

  // Paleta de colores Moca
  const colores = {
    fondo: '#FDFBF7',
    textoPrincipal: '#3E2723',
    textoSecundario: '#8D6E63',
    botonActivo: '#5D4037',
    botonInactivo: '#EFEBE9',
    whatsapp: '#25D366'
  };

  // Función para cambiar la categoría y resetear la subcategoría
  const manejarCambioCategoria = (cat) => {
    setFiltro(cat);
    setSubfiltro('Todas'); // Resetea la subcategoría al cambiar de rubro
  };

  return (
    <div style={{ backgroundColor: colores.fondo, minHeight: '100vh', padding: '40px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Encabezado Moca */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: colores.textoPrincipal, fontSize: '3rem', margin: '0 0 5px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Moca
        </h1>
        <p style={{ color: colores.textoSecundario, fontSize: '1.1rem', margin: 0, letterSpacing: '3px' }}>
          PERFUMES Y MATES
        </p>
      </div>

      {/* Controles de Filtros y Orden */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Botones de Categoría Principal */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {['Todos', 'Mates', 'Perfumes', 'Bombillas'].map((cat) => (
            <button
              key={cat}
              onClick={() => manejarCambioCategoria(cat)}
              style={{
                padding: '10px 25px',
                borderRadius: '25px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'all 0.3s',
                backgroundColor: filtro === cat ? colores.botonActivo : colores.botonInactivo,
                color: filtro === cat ? 'white' : colores.textoPrincipal,
                boxShadow: filtro === cat ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategorías (solo aparecen si seleccionás un rubro y si hay subcategorías cargadas) */}
        {filtro !== 'Todos' && subcategoriasDisponibles.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
             <button
                onClick={() => setSubfiltro('Todas')}
                style={{
                  padding: '6px 15px',
                  borderRadius: '20px',
                  border: `1px solid ${colores.textoSecundario}`,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  backgroundColor: subfiltro === 'Todas' ? colores.textoSecundario : 'transparent',
                  color: subfiltro === 'Todas' ? 'white' : colores.textoSecundario,
                }}
              >
                Todas
              </button>
            {subcategoriasDisponibles.map((subcat) => (
              <button
                key={subcat}
                onClick={() => setSubfiltro(subcat)}
                style={{
                  padding: '6px 15px',
                  borderRadius: '20px',
                  border: `1px solid ${colores.textoSecundario}`,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  backgroundColor: subfiltro === subcat ? colores.textoSecundario : 'transparent',
                  color: subfiltro === subcat ? 'white' : colores.textoSecundario,
                }}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}

        {/* Select para Ordenar por Precio */}
        <select 
          value={orden} 
          onChange={(e) => setOrden(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: `1px solid #ccc`,
            color: colores.textoPrincipal,
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          <option value="defecto">Ordenar por...</option>
          <option value="menor">Precio: Menor a Mayor</option>
          <option value="mayor">Precio: Mayor a Menor</option>
        </select>
      </div>
      
      {/* Grilla de Productos */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        {productosFiltrados.map((prod, index) => (
          <div 
            key={index} 
            style={{ 
              backgroundColor: 'white',
              borderRadius: '15px',
              width: '280px',
              textAlign: 'center',
              boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Foto */}
            {prod.Foto_URL ? (
              <img src={prod.Foto_URL} alt={prod.Producto} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '250px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BDBDBD' }}>
                <span style={{ fontSize: '3rem' }}>📸</span>
              </div>
            )}
            
            {/* Información del Producto */}
            <div style={{ padding: '25px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <p style={{ color: colores.textoSecundario, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>
                {prod.Categoria} {prod.Subcategoria ? `> ${prod.Subcategoria}` : ''}
              </p>
              <h2 style={{ color: colores.textoPrincipal, fontSize: '1.4rem', margin: '0 0 10px 0' }}>
                {prod.Producto}
              </h2>
              
              {/* Descripción (si existe) */}
              {prod.Descripcion && (
                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 15px 0', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {prod.Descripcion}
                </p>
              )}

              <h3 style={{ color: colores.textoPrincipal, fontSize: '1.8rem', fontWeight: 'bold', margin: 'auto 0 20px 0' }}>
                ${prod.Precio_Final}
              </h3>
              
              {/* Botón de WhatsApp conectado a tu número */}
              <a 
                href={`https://wa.me/5492644117588?text=Hola! Me interesa el ${prod.Producto} que vi en el catálogo de Moca.`} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'block',
                  backgroundColor: colores.whatsapp,
                  color: 'white',
                  padding: '12px 15px',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  letterSpacing: '0.5px'
                }}
              >
                Comprar por WhatsApp
              </a>
            </div>
          </div>
        ))}

        {productosFiltrados.length === 0 && (
          <p style={{ color: colores.textoSecundario, fontSize: '1.2rem', textAlign: 'center', width: '100%' }}>
            Aún no subimos productos con estos filtros.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
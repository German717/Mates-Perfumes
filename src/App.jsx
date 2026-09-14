import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [productos, setProductos] = useState([]);
  
  // Estados de filtros y carrito
  const [filtro, setFiltro] = useState('Todos');
  const [subfiltro, setSubfiltro] = useState('Todas');
  const [orden, setOrden] = useState('defecto');
  const [carrito, setCarrito] = useState([]);
  
  // Nuevo estado para mostrar u ocultar el detalle del carrito
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  useEffect(() => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS51PPN1Cs-k5L1palKnzOaNmkwS9F2qRXxyDHUchS9gLecU_Rhq6X6UYtZVT6F7oR9rypjosKV7RxI/pub?gid=572883000&single=true&output=csv&t=' + new Date().getTime();

    Papa.parse(sheetUrl, {
      download: true,
      header: true,
      complete: (results) => {
        const datosLimpios = results.data.filter(
          (prod) => prod.ID && prod.Producto && prod.Producto.toString().trim() !== '' && parseInt(prod.Stock || 0) > 0
        );
        setProductos(datosLimpios);
      },
      error: (err) => {
        console.error("Hubo un error leyendo la tabla:", err);
      }
    });
  }, []);

  // Lógica del Carrito con Control de Stock
  const agregarAlCarrito = (prod) => {
    const cantidadYaEnCarrito = carrito.filter(item => item.ID === prod.ID).length;
    const stockDisponible = parseInt(prod.Stock || 0);

    if (cantidadYaEnCarrito < stockDisponible) {
      setCarrito([...carrito, prod]);
    } else {
      alert(`¡Ups! Solo tenemos ${stockDisponible} unidades de ${prod.Producto} en stock.`);
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setMostrarDetalle(false); // Cerramos el modal si se vacía
  };

  const totalCarrito = carrito.reduce((total, prod) => total + parseFloat(prod.Precio_Final || 0), 0);

  // Nueva función para agrupar los productos (nos sirve para el modal y para WhatsApp)
  const obtenerCarritoAgrupado = () => {
    const agrupado = {};
    carrito.forEach((prod) => {
      if (agrupado[prod.Producto]) {
        agrupado[prod.Producto].cantidad += 1;
        agrupado[prod.Producto].subtotal += parseFloat(prod.Precio_Final || 0);
      } else {
        agrupado[prod.Producto] = { 
          nombre: prod.Producto,
          precioUnitario: parseFloat(prod.Precio_Final || 0),
          cantidad: 1, 
          subtotal: parseFloat(prod.Precio_Final || 0) 
        };
      }
    });
    return Object.values(agrupado);
  };

  const armarMensajeWhatsApp = () => {
    let mensaje = "Hola Moca! 👋 Quiero encargar lo siguiente:%0A%0A";
    
    const agrupados = obtenerCarritoAgrupado();
    agrupados.forEach((item) => {
      mensaje += `▪️ ${item.cantidad}x ${item.nombre} ($${item.precioUnitario} c/u)%0A`;
    });

    mensaje += `%0A*Total: $${totalCarrito}*%0A%0A`;
    mensaje += "_Entendido lo del envío por UberEnvios o retiro por el local. ¡Gracias!_";
    
    return `https://wa.me/5492644117588?text=${mensaje}`;
  };

  // Filtros
  let productosFiltrados = productos.filter(prod => {
    if (filtro === 'Todos') return true;
    return prod.Categoria && prod.Categoria.toLowerCase().trim() === filtro.toLowerCase();
  });

  const subcategoriasDisponibles = [...new Set(productosFiltrados
    .map(prod => prod.Subcategoria ? prod.Subcategoria.trim() : '')
    .filter(sub => sub !== '')
  )];

  if (filtro !== 'Todos' && subfiltro !== 'Todas') {
    productosFiltrados = productosFiltrados.filter(prod => 
      prod.Subcategoria && prod.Subcategoria.trim() === subfiltro
    );
  }

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
    whatsapp: '#25D366',
    alerta: '#F8E9DE',
    desactivado: '#D7CCC8'
  };

  const manejarCambioCategoria = (cat) => {
    setFiltro(cat);
    setSubfiltro('Todas');
  };

  return (
    <div style={{ backgroundColor: colores.fondo, minHeight: '100vh', padding: '40px 20px 100px 20px', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* Encabezado Moca con Logo de Imagen */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <img 
          src="https://i.postimg.cc/TYZBGYss/Un-logotipo-minimalista-y-elegante-para-una-marca-llamada-MO-(1).jpg" 
          alt="Moca Perfumes y Mates" 
          style={{ width: '320px', maxWidth: '100%', height: 'auto', mixBlendMode: 'multiply' }} 
        />
      </div>

      {/* Banner de Envíos */}
      <div style={{ maxWidth: '800px', margin: '0 auto 40px auto', backgroundColor: colores.alerta, padding: '15px 20px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${colores.textoSecundario}40` }}>
        <p style={{ margin: 0, color: colores.textoPrincipal, fontSize: '0.95rem' }}>
          📦 <strong>Envíos:</strong> Se coordinan por mensaje. Sujetos a tarifa de <strong>UberEnvios</strong>, o retiro <strong>sin cargo</strong> por nuestro local en San Juan.
        </p>
      </div>

      {/* Controles de Filtros y Orden */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
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
        {productosFiltrados.map((prod, index) => {
          const cantidadYaEnCarrito = carrito.filter(item => item.ID === prod.ID).length;
          const stockDisponible = parseInt(prod.Stock || 0);
          const sinStockAdicional = cantidadYaEnCarrito >= stockDisponible;

          return (
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
              {prod.Foto_URL ? (
                <img src={prod.Foto_URL} alt={prod.Producto} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '250px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BDBDBD' }}>
                  <span style={{ fontSize: '3rem' }}>📸</span>
                </div>
              )}
              
              <div style={{ padding: '25px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <p style={{ color: colores.textoSecundario, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>
                  {prod.Categoria} {prod.Subcategoria ? `> ${prod.Subcategoria}` : ''}
                </p>
                <h2 style={{ color: colores.textoPrincipal, fontSize: '1.4rem', margin: '0 0 10px 0' }}>
                  {prod.Producto}
                </h2>
                
                {prod.Descripcion && (
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 15px 0', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {prod.Descripcion}
                  </p>
                )}

                <p style={{ color: colores.textoSecundario, fontSize: '0.85rem', margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  Stock disponible: {stockDisponible - cantidadYaEnCarrito}
                </p>

                <h3 style={{ color: colores.textoPrincipal, fontSize: '1.8rem', fontWeight: 'bold', margin: 'auto 0 20px 0' }}>
                  ${prod.Precio_Final}
                </h3>
                
                <button 
                  onClick={() => agregarAlCarrito(prod)}
                  disabled={sinStockAdicional}
                  style={{
                    display: 'block',
                    backgroundColor: sinStockAdicional ? colores.desactivado : colores.textoPrincipal,
                    color: sinStockAdicional ? '#888' : 'white',
                    padding: '12px 15px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    letterSpacing: '0.5px',
                    cursor: sinStockAdicional ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  {sinStockAdicional ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Ventana Flotante (Modal) del Detalle del Carrito */}
      {mostrarDetalle && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${colores.botonInactivo}`, paddingBottom: '15px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: colores.textoPrincipal, fontSize: '1.5rem' }}>Tu Pedido</h2>
              <button onClick={() => setMostrarDetalle(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: colores.textoSecundario }}>✖</button>
            </div>
            
            {obtenerCarritoAgrupado().map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: `1px solid ${colores.botonInactivo}`, paddingBottom: '15px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: colores.textoPrincipal, marginRight: '5px' }}>{item.cantidad}x</span> 
                  <span style={{ color: colores.textoPrincipal }}>{item.nombre}</span>
                  <div style={{ fontSize: '0.85rem', color: colores.textoSecundario, marginTop: '3px' }}>${item.precioUnitario} c/u</div>
                </div>
                <div style={{ fontWeight: 'bold', color: colores.textoPrincipal }}>
                  ${item.subtotal}
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.3rem', fontWeight: 'bold', color: colores.textoPrincipal }}>
              <span>Total:</span>
              <span>${totalCarrito}</span>
            </div>
            
            <button onClick={vaciarCarrito} style={{ display: 'block', width: '100%', padding: '12px', marginTop: '25px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              Vaciar Carrito
            </button>
          </div>
        </div>
      )}

      {/* Barra Flotante Inferior del Carrito */}
      {carrito.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          backgroundColor: 'white', 
          padding: '15px 20px', 
          boxShadow: '0 -4px 15px rgba(0,0,0,0.1)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ margin: 0, fontWeight: 'bold', color: colores.textoSecundario }}>{carrito.length} items</span>
              <button onClick={() => setMostrarDetalle(true)} style={{ background: 'transparent', border: 'none', color: colores.textoPrincipal, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', padding: 0, fontWeight: 'bold' }}>
                Ver detalle
              </button>
            </div>
            <p style={{ margin: 0, color: colores.textoPrincipal, fontWeight: 'bold', fontSize: '1.4rem' }}>Total: ${totalCarrito}</p>
          </div>
          
          <a 
            href={armarMensajeWhatsApp()} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              backgroundColor: colores.whatsapp, 
              color: 'white', 
              padding: '12px 25px', 
              borderRadius: '25px', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 6px rgba(37, 211, 102, 0.3)'
            }}
          >
            Enviar Pedido 📲
          </a>
        </div>
      )}

    </div>
  );
}

export default App;
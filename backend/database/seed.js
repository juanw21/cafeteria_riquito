const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const categories = [
  ['Cafés calientes', 'Cafés preparados calientes.', 1],
  ['Cafés fríos', 'Bebidas frías preparadas con café.', 2],
  ['Bebidas sin café', 'Bebidas calientes y frías sin café.', 3],
  ['Desayunos', 'Opciones sencillas para empezar el día.', 4],
  ['Sándwiches y salados', 'Sándwiches y opciones saladas.', 5],
  ['Repostería', 'Panes y repostería para acompañar una bebida.', 6],
  ['Postres', 'Postres para disfrutar en cualquier momento.', 7]
];

const productRows = [
  ['Cafés calientes','Espresso','Café intenso preparado al momento.',12,'Café espresso.'],
  ['Cafés calientes','Americano','Espresso servido con agua caliente.',14,'Café espresso y agua.'],
  ['Cafés calientes','Cappuccino','Espresso con leche vaporizada y espuma.',18,'Café espresso y leche.'],
  ['Cafés calientes','Latte','Espresso suave con leche vaporizada.',20,'Café espresso y leche.'],
  ['Cafés calientes','Mocaccino','Café con leche y chocolate.',22,'Café espresso, leche y chocolate.'],
  ['Cafés calientes','Café con leche','Café acompañado de leche caliente.',16,'Café y leche.'],
  ['Cafés fríos','Iced Americano','Espresso con agua y hielo.',17,'Café espresso, agua y hielo.'],
  ['Cafés fríos','Iced Latte','Espresso con leche fría y hielo.',22,'Café espresso, leche y hielo.'],
  ['Cafés fríos','Frappé de café','Bebida fría licuada con café.',25,'Café, leche, hielo y azúcar.'],
  ['Cafés fríos','Frappé de chocolate','Bebida fría licuada con chocolate.',25,'Leche, chocolate, hielo y azúcar.'],
  ['Bebidas sin café','Chocolate caliente','Chocolate preparado con leche caliente.',18,'Leche y chocolate.'],
  ['Bebidas sin café','Limonada clásica','Limonada fresca preparada al momento.',14,'Limón, agua y azúcar.'],
  ['Bebidas sin café','Limonada con hierbabuena','Limonada fresca con hierbabuena.',16,'Limón, hierbabuena, agua y azúcar.'],
  ['Bebidas sin café','Jugo de naranja','Jugo de naranja.',18,'Naranja.'],
  ['Desayunos','Desayuno Riquito','Desayuno de la casa con tostadas, huevo y bebida caliente.',28,'Pan tostado, huevo y café o té.'],
  ['Desayunos','Tostadas con mermelada','Pan tostado servido con mermelada.',16,'Pan y mermelada.'],
  ['Desayunos','Sándwich de huevo','Sándwich preparado con huevo.',20,'Pan, huevo y vegetales.'],
  ['Sándwiches y salados','Sándwich mixto','Sándwich caliente de queso y jamón.',22,'Pan, queso y jamón.'],
  ['Sándwiches y salados','Sándwich de pollo','Sándwich de pollo con vegetales.',26,'Pan, pollo y vegetales.'],
  ['Sándwiches y salados','Tostado de queso','Pan tostado con queso fundido.',18,'Pan y queso.'],
  ['Sándwiches y salados','Empanada de queso','Empanada rellena de queso.',10,'Masa y queso.'],
  ['Repostería','Croissant','Croissant horneado.',14,'Harina, mantequilla, leche y huevo.'],
  ['Repostería','Brownie de chocolate','Brownie de chocolate.',16,'Chocolate, harina, mantequilla, azúcar y huevo.'],
  ['Repostería','Muffin de vainilla','Muffin con sabor a vainilla.',14,'Harina, leche, huevo, azúcar y vainilla.'],
  ['Repostería','Roll de canela','Pan enrollado con canela.',17,'Harina, canela, azúcar y mantequilla.'],
  ['Postres','Cheesecake','Pastel de queso.',22,'Queso crema, galleta, azúcar y huevo.'],
  ['Postres','Torta de chocolate','Porción de torta de chocolate.',20,'Chocolate, harina, azúcar, mantequilla y huevo.'],
  ['Postres','Pie de limón','Pie con relleno de limón.',20,'Limón, leche condensada, galleta y huevo.']
];

const services = [
  ['Consumo en el local','Disfruta bebidas y alimentos en un ambiente acogedor.',1],
  ['Pedidos para recoger','Haz tu pedido y recógelo en el establecimiento.',2],
  ['Pedidos para llevar','Opciones de bebidas y alimentos para llevar.',3],
  ['Atención para reuniones pequeñas','Consulta disponibilidad para reuniones pequeñas.',4]
];

const content = [
  ['inicio','Riquito Riquito','Un antojito, una pausa y un momento riquito.','Café de barrio para disfrutar cafés, bebidas, desayunos, sándwiches y algo dulce. Los precios publicados son demostrativos y pueden actualizarse.'],
  ['nosotros','Un espacio para hacer una pausa','Café y antojos para compartir','Riquito Riquito reúne bebidas y opciones dulces y saladas en un ambiente cercano y acogedor.'],
  ['historia','Nuestra historia','Una cafetería hecha para disfrutar','Riquito Riquito nace como una propuesta de cafetería de barrio. Esta presentación no incluye fechas ni datos biográficos no confirmados.'],
  ['servicios','Nuestros servicios','Opciones para cada momento','Disfruta en el local, pide para recoger o lleva tu pedido contigo. Para reuniones pequeñas, consulta disponibilidad.'],
  ['menu','Menú','Bebidas y antojos','Encuentra cafés calientes y fríos, bebidas sin café, desayunos, sándwiches, repostería y postres. Los precios están en BOB y son demostrativos.'],
  ['especialidades','Especialidades de la casa','Favoritos para probar','Una selección de bebidas y antojos destacados de Riquito Riquito.'],
  ['contacto','Contacto','Estamos preparando nuestros datos de contacto','La dirección, el teléfono y el correo están pendientes de confirmación.'],
  ['galeria','Galería','Un vistazo a la experiencia','Un espacio acogedor, café preparado al momento y algo rico para acompañar.']
];

const faqs = [
  ['¿Qué productos ofrece la cafetería?','La carta incluye cafés calientes y fríos, bebidas sin café, desayunos, sándwiches, repostería y postres.','productos, menú, carta','menú'],
  ['¿Qué cafés calientes tienen?','La carta incluye espresso, americano, cappuccino, latte, mocaccino y café con leche.','café, caliente, espresso, cappuccino, latte','productos'],
  ['¿Qué bebidas frías ofrecen?','Hay Iced Americano, Iced Latte, frappé de café, frappé de chocolate y limonadas.','frío, iced, frappé, limonada','productos'],
  ['¿Ofrecen desayunos?','Sí. La carta incluye Desayuno Riquito, tostadas con mermelada y sándwich de huevo.','desayuno, mañana','productos'],
  ['¿Tienen postres?','Sí. Hay cheesecake, torta de chocolate y pie de limón; también contamos con repostería.','postre, dulce, cheesecake, torta','productos'],
  ['¿Cuánto cuesta el cappuccino?','El precio demostrativo del cappuccino es Bs 18. Confirma el precio vigente al realizar tu pedido.','cappuccino, precio','precios'],
  ['¿Cuáles son las especialidades?','Entre las especialidades están el Cappuccino de la casa, Frappé de café, Desayuno Riquito, Brownie de chocolate, Cheesecake y Sándwich de pollo.','especialidad, recomendado','productos'],
  ['¿Cuál es la dirección?','La dirección de la cafetería aún está pendiente de confirmación.','dirección, ubicación, mapa','contacto'],
  ['¿Cuál es el horario de atención?','El horario de atención está pendiente de confirmación.','horario, abierto, atención','contacto'],
  ['¿Puedo pedir para recoger?','Sí, ofrecemos pedidos para recoger en el establecimiento.','recoger, pedido, pickup','servicios'],
  ['¿Cómo puedo contactar a la cafetería?','Los datos de teléfono y correo están pendientes de confirmación.','contacto, teléfono, correo, email','contacto'],
  ['¿Los precios son definitivos?','Los precios publicados son demostrativos en bolivianos (BOB) y deben confirmarse al realizar el pedido.','precio, bolivianos, BOB','precios']
];

const galleryImages = [
  ['El ambiente de la cafetería','Un espacio cálido para disfrutar una pausa.','https://images.pexels.com/photos/5851732/pexels-photo-5851732.jpeg?auto=compress&cs=tinysrgb&w=1200',1],
  ['Arte latte','Café preparado con detalle.','https://images.pexels.com/photos/39475008/pexels-photo-39475008.jpeg?auto=compress&cs=tinysrgb&w=1200',2],
  ['Café en la barra','Una taza de café para disfrutar sin prisa.','https://images.pexels.com/photos/29253460/pexels-photo-29253460.jpeg?auto=compress&cs=tinysrgb&w=1200',3],
  ['Un rincón para compartir','Un ambiente cómodo para reunirse y conversar.','https://images.pexels.com/photos/1833769/pexels-photo-1833769.jpeg?auto=compress&cs=tinysrgb&w=1200',4],
  ['Café y repostería','Algo dulce para acompañar tu bebida favorita.','https://images.pexels.com/photos/30948318/pexels-photo-30948318.jpeg?auto=compress&cs=tinysrgb&w=1200',5],
  ['Una pausa con café','Disfruta los pequeños momentos.','https://images.pexels.com/photos/29638681/pexels-photo-29638681.jpeg?auto=compress&cs=tinysrgb&w=1200',6]
];

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  });
  const counts = {};
  const add = (key) => { counts[key] ||= { insertados: 0, existentes: 0 }; };
  const insertIfMissing = async (key, sql, values, lookupSql, lookupValues) => {
    add(key);
    const [found] = await db.execute(lookupSql, lookupValues);
    if (found.length) { counts[key].existentes++; return found[0]; }
    const [result] = await db.execute(sql, values);
    counts[key].insertados++;
    return { id: result.insertId };
  };

  try {
    const [tables] = await db.execute(
      `SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE()`
    );
    const names = new Set(tables.map((row) => row.TABLE_NAME));
    for (const required of ['categorias','productos','servicios','especialidades','contenido_sitio','configuracion_cafeteria','galeria','preguntas_frecuentes']) {
      if (!names.has(required)) throw new Error(`Falta la tabla requerida: ${required}. Ejecuta npm run db:init primero.`);
    }

    await db.beginTransaction();
    const categoryIds = new Map();
    for (const [nombre, descripcion, orden] of categories) {
      const row = await insertIfMissing('categorias',
        'INSERT INTO categorias (nombre, descripcion, orden, activo) VALUES (?, ?, ?, TRUE)',
        [nombre, descripcion, orden],
        'SELECT id FROM categorias WHERE nombre = ? LIMIT 1', [nombre]);
      categoryIds.set(nombre, row.id);
    }

    const productIds = new Map();
    for (let i = 0; i < productRows.length; i++) {
      const [category, nombre, descripcion, precio, ingredientes] = productRows[i];
      const destacado = ['Cappuccino','Latte','Frappé de café','Desayuno Riquito','Sándwich de pollo','Brownie de chocolate','Cheesecake'].includes(nombre);
      const row = await insertIfMissing('productos',
        'INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen, disponible, destacado, ingredientes) VALUES (?, ?, ?, ?, NULL, TRUE, ?, ?)',
        [categoryIds.get(category), nombre, descripcion, precio, destacado, ingredientes],
        'SELECT id FROM productos WHERE categoria_id = ? AND nombre = ? LIMIT 1', [categoryIds.get(category), nombre]);
      productIds.set(nombre, row.id);
    }

    for (const [nombre, descripcion, orden] of services) {
      await insertIfMissing('servicios',
        'INSERT INTO servicios (nombre, descripcion, activo, orden) VALUES (?, ?, TRUE, ?)',
        [nombre, descripcion, orden], 'SELECT id FROM servicios WHERE nombre = ? LIMIT 1', [nombre]);
    }

    const specialties = [
      ['Cappuccino de la casa','Una preparación cremosa de espresso y leche vaporizada.','Cappuccino'],
      ['Frappé de café','Bebida fría licuada preparada con café.','Frappé de café'],
      ['Desayuno Riquito','Una opción de desayuno con tostadas, huevo y bebida.','Desayuno Riquito'],
      ['Brownie de chocolate','Brownie de chocolate para acompañar el café.','Brownie de chocolate'],
      ['Cheesecake','Pastel de queso de la selección dulce.','Cheesecake'],
      ['Sándwich de pollo','Sándwich de pollo con vegetales.','Sándwich de pollo']
    ];
    for (let i = 0; i < specialties.length; i++) {
      const [nombre, descripcion, producto] = specialties[i];
      await insertIfMissing('especialidades',
        'INSERT INTO especialidades (producto_id, nombre, descripcion, activo, orden) VALUES (?, ?, ?, TRUE, ?)',
        [productIds.get(producto), nombre, descripcion, i + 1],
        'SELECT id FROM especialidades WHERE nombre = ? LIMIT 1', [nombre]);
    }

    for (const [seccion, titulo, subtitulo, texto] of content) {
      await insertIfMissing('contenido_sitio',
        'INSERT INTO contenido_sitio (seccion, titulo, subtitulo, contenido, activo) VALUES (?, ?, ?, ?, TRUE)',
        [seccion, titulo, subtitulo, texto], 'SELECT id FROM contenido_sitio WHERE seccion = ? LIMIT 1', [seccion]);
    }
    // Retira únicamente el aviso de imágenes de stock que dejó la carga previa.
    await db.execute(
      `UPDATE contenido_sitio SET contenido = ? WHERE seccion = 'galeria'
       AND (contenido LIKE '%Pexels%' OR contenido LIKE '%stock%' OR contenido LIKE '%no representa%')`,
      ['Un espacio acogedor, café preparado al momento y algo rico para acompañar.']
    );

    add('galeria');
    for (const [titulo, descripcion, ruta, orden] of galleryImages) {
      await insertIfMissing('galeria',
        'INSERT INTO galeria (titulo, descripcion, ruta_archivo, tipo, orden, activo) VALUES (?, ?, ?, ?, ?, TRUE)',
        [titulo, descripcion, ruta, 'imagen', orden],
        'SELECT id FROM galeria WHERE ruta_archivo = ? LIMIT 1', [ruta]);
    }
    await db.execute(
      `UPDATE galeria SET descripcion = 'Video de ambiente para la portada.'
       WHERE tipo = 'video' AND (descripcion LIKE '%Pexels%' OR descripcion LIKE '%stock%' OR descripcion LIKE '%no representa%')`
    );

    add('configuracion_cafeteria');
    const [config] = await db.execute('SELECT * FROM configuracion_cafeteria WHERE id = 1');
    if (!config.length) {
      await db.execute(
        `INSERT INTO configuracion_cafeteria
         (id, nombre_comercial, direccion, telefono, email, horario_atencion, ubicacion_mapa, moneda, redes_sociales)
         VALUES (1, 'Riquito Riquito', NULL, NULL, NULL, 'Horario pendiente de confirmación', NULL, 'BOB', JSON_OBJECT())`
      );
      counts.configuracion_cafeteria.insertados++;
    } else {
      counts.configuracion_cafeteria.existentes++;
      const current = config[0];
      const fields = [];
      const values = [];
      if (!current.nombre_comercial) { fields.push('nombre_comercial = ?'); values.push('Riquito Riquito'); }
      if (!current.horario_atencion) { fields.push('horario_atencion = ?'); values.push('Horario pendiente de confirmación'); }
      if (!current.moneda) { fields.push('moneda = ?'); values.push('BOB'); }
      if (!current.redes_sociales) { fields.push('redes_sociales = JSON_OBJECT()'); }
      if (fields.length) await db.execute(`UPDATE configuracion_cafeteria SET ${fields.join(', ')} WHERE id = 1`, values);
    }

    for (const [pregunta, respuesta, palabras, categoria] of faqs) {
      await insertIfMissing('preguntas_frecuentes',
        'INSERT INTO preguntas_frecuentes (pregunta, respuesta, palabras_clave, categoria, activo) VALUES (?, ?, ?, ?, TRUE)',
        [pregunta, respuesta, palabras, categoria], 'SELECT id FROM preguntas_frecuentes WHERE pregunta = ? LIMIT 1', [pregunta]);
    }

    await db.commit();
    console.log(`Carga inicial completada en ${process.env.DB_NAME}.`);
    for (const [table, result] of Object.entries(counts)) {
      console.log(`${table}: ${result.insertados} insertados, ${result.existentes} existentes sin modificar`);
    }
    console.log('Los precios son demostrativos en BOB; las fotos se sirven desde el proyecto frontend.');
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

run().catch((error) => {
  console.error(`No se completó la carga: ${error.message}`);
  process.exitCode = 1;
});

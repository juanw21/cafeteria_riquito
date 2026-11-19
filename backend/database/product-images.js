const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const photos = [
  [24783440, ['Espresso', 'Café con leche']],
  [4736078, ['Americano']],
  [39475008, ['Cappuccino']],
  [29253460, ['Latte']],
  [10934444, ['Mocaccino']],
  [9355887, ['Iced Americano', 'Frappé de café']],
  [36447675, ['Iced Latte']],
  [10545074, ['Frappé de chocolate']],
  [9622378, ['Chocolate caliente']],
  [12973255, ['Limonada clásica', 'Limonada con hierbabuena']],
  [4443515, ['Jugo de naranja']],
  [36525142, ['Desayuno Riquito']],
  [2402506, ['Tostadas con mermelada']],
  [20422125, ['Sándwich de huevo']],
  [40406964, ['Sándwich mixto', 'Empanada de queso']],
  [16677734, ['Sándwich de pollo']],
  [27298494, ['Tostado de queso']],
  [14565940, ['Croissant']],
  [15580728, ['Brownie de chocolate', 'Brownie de la casa']],
  [7149383, ['Muffin de vainilla']],
  [18058319, ['Roll de canela']],
  [13692942, ['Cheesecake']],
  [9501691, ['Torta de chocolate']],
  [5419101, ['Pie de limón']]
];

async function main() {
  const photoDirectory = path.resolve(__dirname, '../../frontend/public/uploads/productos');
  await fs.mkdir(photoDirectory, { recursive: true });
  for (const [photoId] of photos) {
    const filePath = path.join(photoDirectory, `${photoId}.jpg`);
    try { await fs.access(filePath); continue; } catch {}
    const url = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1000`;
    const response = await fetch(url);
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`No se pudo descargar la imagen ${photoId} desde Pexels (HTTP ${response.status}).`);
    }
    await fs.writeFile(filePath, Buffer.from(await response.arrayBuffer()));
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  });

  try {
    await db.beginTransaction();
    let assigned = 0;
    let alreadySet = 0;
    for (const [photoId, productNames] of photos) {
      const imagePath = `/uploads/productos/${photoId}.jpg`;
      for (const name of productNames) {
        const [rows] = await db.execute(
          `SELECT p.id, p.imagen
           FROM productos p JOIN categorias c ON c.id = p.categoria_id
           WHERE c.nombre = ? AND (p.nombre = ? OR (? IN ('Brownie de chocolate','Brownie de la casa') AND p.nombre LIKE 'Brownie%'))
           ORDER BY p.id LIMIT 1`,
          [categoryFor(name), name, name]
        );
        if (!rows.length) throw new Error(`No se encontró el producto: ${name}`);
        if (rows[0].imagen) { alreadySet++; continue; }
        await db.execute('UPDATE productos SET imagen = ? WHERE id = ?', [imagePath, rows[0].id]);
        assigned++;
      }
    }
    await db.commit();
    console.log(`Imágenes asignadas: ${assigned}; productos con imagen previa conservada: ${alreadySet}.`);
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

function categoryFor(name) {
  if (['Espresso','Americano','Cappuccino','Latte','Mocaccino','Café con leche'].includes(name)) return 'Cafés calientes';
  if (['Iced Americano','Iced Latte','Frappé de café','Frappé de chocolate'].includes(name)) return 'Cafés fríos';
  if (['Chocolate caliente','Limonada clásica','Limonada con hierbabuena','Jugo de naranja'].includes(name)) return 'Bebidas sin café';
  if (['Desayuno Riquito','Tostadas con mermelada','Sándwich de huevo'].includes(name)) return 'Desayunos';
  if (['Sándwich mixto','Sándwich de pollo','Tostado de queso','Empanada de queso'].includes(name)) return 'Sándwiches y salados';
  if (['Croissant','Brownie de chocolate','Brownie de la casa','Muffin de vainilla','Roll de canela'].includes(name)) return 'Repostería';
  return 'Postres';
}

main().catch((error) => {
  console.error(`No se asignaron imágenes: ${error.message}`);
  process.exitCode = 1;
});

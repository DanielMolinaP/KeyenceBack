const { Router } = require("express");
const { Data, NameFile } = require("../db.js");
const XLSX = require('xlsx');
const path = require('path');

const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);



router.post("/data", async (req, res) => {

  const workbook = XLSX.readFile(req.file.path); // Lee el archivo de Excel cargado.
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Obtiene la primera hoja del archivo.
  const rows = XLSX.utils.sheet_to_json(worksheet); // Convierte los datos en formato JSON.
  const fileNameR = path.parse(req.file.originalname).name;
  // console.log(fileName)
  // console.log(typeof(fileName))
  try {

    NameFile.findOrCreate({
      where: {
        fileName: fileNameR,
      },
    });

    const data = await Promise.all(
      rows.map(async (row) => {
        const newData = await Data.create({
          UserID: row.UserID,
          userName: row.userName,
          date: row.date,
          punchIn: row.punchIn,
          punchOut: row.punchOut,
          fileName: fileNameR
        });
        return newData;
      })
    );
    res.send('Archivo cargado y datos guardados con éxito');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al guardar los datos');
  }
});

router.get("/tables/", async (req, res) => {
  const { name } = req.query;
  const allData = await Data.findAll();
  let noTableName = []
  if (name) {
    let tableName = await allData.filter((e) =>
      e.fileName.toLowerCase().includes(name.toLowerCase())
    ); //aqui traemos el personaje que en el juego incluya el nombre que se le pasan ej: http://localhost:3001/videogames?name=halo te traera a "Halo", "Halo infinite","Halo Wars" etc.
    tableName.length
      ? res.status(200).send(tableName)
      : res.status(200).send(noTableName);
  } else {
    res.status(200).send(allData);
  }

});

router.get("/fileName/", async (req, res) => {
  const { name } = req.query;
  const allFileNames = await NameFile.findAll();
  let noFileTableName = []
  if (name) {
    let fileTableName = allFileNames.filter((e) =>
      e.fileName.toLowerCase() === name.toLowerCase()
    );
    fileTableName.length
      ? res.status(200).send(fileTableName)
      : res.status(200).send(noFileTableName);
  } else {
    res.status(200).send(allFileNames);
  }
});


router.delete("/deleteFileName", (req, res) => {
  const { fileId } = req.body;
  NameFile.destroy({ where: { id: fileId } })
    .then(() => {
      res.status(200).send("Removed Successfully");
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
});

router.put("/updateData", (req, res) => {
  const datos = req.body;
  const { id } = req.body;
  try {
    Data.update(datos, { where: { id } });
    return res.send("change Successfully");
  } catch (err) {
    res.status(400).send(err);
  }
});


module.exports = router;

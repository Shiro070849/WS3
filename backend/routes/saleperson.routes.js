const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (app) => {
  const saleperson = require("../controllers/saleperson.controller.js");

  app.get("/api/saleperson/", saleperson.Getlist_SalesPerson);
  app.post("/api/saleperson/login", saleperson.login);
  app.post("/api/saleperson/add", saleperson.addSalePerson);
  app.get("/api/saleperson/:id/signature", saleperson.getSignature);
  app.post("/api/saleperson/upload-signature", upload.single('signature'), saleperson.uploadSignature);
  app.put("/api/saleperson/update-status", saleperson.updateSalePersonStatus);
  app.post("/api/saleperson/add-auto-id", saleperson.addSalePersonAutoId);
  app.post("/api/saleperson/import-excel", saleperson.importExcel);
  app.get("/api/saleperson/download-template", saleperson.downloadTemplate);
  app.put("/api/saleperson/update", saleperson.updateSalePerson);
};
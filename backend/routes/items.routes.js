module.exports = (app) => {
  let Items = require("../controllers/items.controller");

  app.post("/Items/Getlist_Items", Items.Getlist_Items);
  app.post("/Items/Getlis_ItemById", Items.Getlist_ItemsById);
  app.post("/Items/AddItem", Items.AddItem);
  app.get("/Items/DownloadCenterPriceTemplate", Items.DownloadCenterPriceTemplate);
  app.get("/Items/Getlist_Items", Items.Getlist_Items);
  app.put("/Items/UpdatePrice", Items.UpdateItemPrice);
  app.post("/Items/ImportCenterPrice", Items.ImportCenterPrice);
  app.get("/Items/GetPaymentTerms", Items.GetPaymentTerms);
  app.get("/Items/DownloadPaymentTermsTemplate", Items.DownloadPaymentTermsTemplate);
  app.post("/Items/ImportPaymentTerms", Items.ImportPaymentTerms);
  app.post("/Items/ImportFoodItems", Items.uploadFoodFileMiddleware, Items.ImportFoodItems);
  app.get("/Items/GetFoodItems", Items.Getlist_FoodItems);
  app.post("/Items/GetFoodItems", Items.Getlist_FoodItems);
  app.post("/Items/GetGeneralItems", Items.Getlist_GeneralItems);

};
const express = require("express");
const db = require("./db");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
  try {
    const result = await db.fetchUsers();
    res.send(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products", async (req, res, next) => {
  try {
    const result = await db.fetchProducts();
    res.send(result);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const result = await db.fetchFavorites();
    res.send(result);
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:id/favorites", async (req, res, next) => {
  try {
    const { product, user } = req.body;
    const {id} = req.params;
    const result = await db.createFavorites(product, id);
    res.send(result);
  } catch (error) {
    next(error);
  }

});

app.delete("/api/users/:userId/favorites/:id", async (req, res, next) => {
    try{
        const {userId, id} = req.params;
        const result = await db.destroyFavorite(userId, id);
        res.sendStatus(204);
    }catch(error){
        next(error)
    }
})
const init = async () => {
  await db.init();
  app.listen(3001, () => console.log("listening on port 3001"));
  console.log("App Init =)");
};

init();

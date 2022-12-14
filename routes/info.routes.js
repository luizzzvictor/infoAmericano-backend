import express from "express";
import infoModel from "../models/info.model.js";
import reparacaoModel from "../models/reparacao.model.js";
import dataInfos from "../data/infos.json" assert { type: "json" };
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import UserModel from "../models/user.model.js";

const infoRouter = express.Router();

infoRouter.get("/", async (req, res) => {
  try {
    const infos = await infoModel.find().populate("reparacao", "reparacao");

    console.log(infos.length, "Infos cadastradas!👁️");

    return res.status(200).json(infos);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.get("/getinfosprestadas", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const infosPrestadas = await infoModel.find({usuario_informante: req.currentUser._id}).populate("reparacao", "reparacao")

    console.log(infosPrestadas)

    // console.log(infos.length, "Infos cadastradas!👁️");

    return res.status(200).json(infosPrestadas );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const info = await infoModel
      .findById(id)
      .populate("reparacao", "reparacao")
      .populate({
        path: "usuario_informante",
        populate: { path: "orgao", model: "Orgao" },
      });

    if (!info) {
      return res.status(404).json("Info não foi encontrada!");
    }

    return res.status(200).json(info);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.post(
  "/:reparacaoId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const { reparacaoId } = req.params;
      const userData = req.auth;

      const newInfo = await infoModel.create({
        ...req.body,
        reparacao: reparacaoId,
        usuario_informante: userData._id,
      });
      console.log(`Info sobre Medida de Reparação criada com sucesso! ✅✅✅`);
      await reparacaoModel.findByIdAndUpdate(reparacaoId, {
        $push: { infos_cumprimento: newInfo._id },
      });

      return res.status(201).json(newInfo);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Algo está errado" });
    }
  }
);

//rota para editar info, a partir da página de Reparacao
infoRouter.put("/editfromreparacoes", async (req, res) => {
  try {
    const idDaInfo = req.body._id;

    delete req.body._id;

    const infoEditada = await infoModel.findByIdAndUpdate(
      idDaInfo,
      { ...req.body },
      { new: true, runValidators: true }
    );
    console.log(`Info sobre Medida de Reparação editada com sucesso! 📝📝📝`);

    return res.status(201).json(infoEditada);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const update = await infoModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    console.log(`Informação💡`, update._id, `💡 editada com sucesso! 📝`);

    return res.status(200).json(update);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.post("/p/createManyInfos", async (req, res) => {
  try {
    const postingInfos = await infoModel.insertMany(dataInfos);
    console.log(postingInfos.length, `Infos criadas! ✅✅✅`);

    const creatingRefs = await postingInfos.forEach(async (eachInfo) => {
      let random = Math.floor(Math.random() * 85);

      await reparacaoModel
        .findOne()
        .skip(random)
        .exec(async function (err, result) {
          const reparacaoAleatoria = await result.updateOne({
            $push: { infos_cumprimento: eachInfo._id },
          });
          await infoModel.updateOne(eachInfo, { reparacao: result._id });
        });

      //// MODIFICAR PARA INSERIR INFOS AUTOMÁTICAS DE ALGUM PRESTADOR
      const usuariosInformantes = await UserModel.find();
      let randomUser = Math.floor(Math.random() * usuariosInformantes.length);

      await infoModel.updateOne(eachInfo, {
        usuario_informante: usuariosInformantes[randomUser],
      });
    });
    console.log(postingInfos.length, `Infos povoadas aleatoriamente! 👨‍👨‍👦`);

    return res.status(201).json(postingInfos);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});

infoRouter.delete("/:infoId", async (req, res) => {
  try {
    const { infoId } = req.params;

    const deleteInfo = await infoModel.findByIdAndDelete(infoId);

    await reparacaoModel.findByIdAndUpdate(deleteInfo.reparacao, {
      $pull: { infos_cumprimento: infoId },
    });

    console.log(`Info id:`, deleteInfo._id, `deletada! ❌`);

    return res.status(200).json(deleteInfo);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Algo está errado" });
  }
});
export default infoRouter;

infoRouter.delete("/d/delete-all", async (request, response) => {
  try {
    const deleteAllInfos = await infoModel.deleteMany();
    console.log(deleteAllInfos.deletedCount, `Infos deletadas! ❌❌❌`);

    await reparacaoModel.updateMany({}, { infos_cumprimento: [] });

    return response.status(200).json(deleteAll);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ msg: "Algo está errado" });
  }
});

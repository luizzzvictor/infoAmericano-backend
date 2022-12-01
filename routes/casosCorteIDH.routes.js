import express from "express";
import { v4 as uuidv4 } from "uuid";
import CasoCorteIDHModel from "../models/casosCorteIDH.models.js";

const router = express.Router();

let data = [
  {
    caso: "Ximenes Lopes",
    tipo: "Caso Contencioso",
    data_sentenca: "04/07/2006",
    localidade: {
      estado: "Ceará",
      cidade: "Sobral",
    },
    vítimas: ["Damião Ximenes", "Albertina Lopes", "Irene Ximenes"],
    em_tramitacao: false,
    em_supervisao: true,
    n_medidas_reparacao: 6,
  },
];

router.get("/", async (request, response) => {
  try {
    const casos = await CasoCorteIDHModel.find();
    return response.status(200).json(casos);
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (request,response) => {
  try {
    const {id} = request.params

    const caso = await CasoCorteIDHModel.findById(id)

    if (!caso) {
      return response.status(404).json("Usuário não foi encontrado!")
    }

    return response.status(200).json(caso)

  } catch (error) {
    console.log (error)
    return response.status.apply(500).json({msg: "Algo está errado"})
  }
})


router.post("/create", async (request, response) => {
  try {
    const newCaso = await CasoCorteIDHModel.create(request.body);

    // modo antigo
    // const newData = {
    //   ...request.body,
    //   id: uuidv4(),
    // };
    // data.push(newData);
    //modo antigo

    return response.status(201).json(newCaso);
  } catch (error) {
    console.log(error);

    return response.status(500).json({ msg: "Algo está errado." });
  }
});

router.put("/edit/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const update = await CasoCorteIDHModel.findByIdAndUpdate(
      id,
      {
        ...request.body,
      },
      { new: true, runValidators: true }
    );

    return response.status(200).json(update);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ msg: "Algo está errado" });
  }
});

router.delete("/delete/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const deleteCaso = await CasoCorteIDHModel.findByIdAndDelete(id);

    return response.status(200).json(deleteCaso);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ msg: "Algo está errado" });
  }
});

export default router;

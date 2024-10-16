const GRAFO_COMPLETO = "grafo_completo";
const GRAFO_DOMINIO = "grafo_dominio";
const GRAFO_CLASSES_DOMINIO = "grafo_classes_dominios";
const GRAFO_CLASSES_DOMINIO_DEPENDENCIAS =
  "grafo_classes_dominios_dependencias";
const CIRCLE_PACKING_DIRETORIO = "circulo_dominio_classes";
const CIRCLE_PACKING_DOMINIO = "circulo_diretorios_classes";

const TipoGrafico = {
  GRAFO_COMPLETO,
  GRAFO_DOMINIO,
  GRAFO_CLASSES_DOMINIO,
  GRAFO_CLASSES_DOMINIO_DEPENDENCIAS,
  CIRCLE_PACKING_DOMINIO,
  CIRCLE_PACKING_DIRETORIO,
};

const JsonData = {
  GRAFO_COMPLETO: {
    json: "grafo_completo.json",
    tipoGrafico: TipoGrafico.GRAFO_COMPLETO,
  },
  GRAFO_DOMINIO: {
    json: "grafo_dominio.json",
    tipoGrafico: TipoGrafico.GRAFO_DOMINIO,
  },
  GRAFO_CLASSES_DOMINIO: {
    json: "grafo_classes_dominios.json",
    tipoGrafico: TipoGrafico.GRAFO_CLASSES_DOMINIO,
  },
  GRAFO_CLASSES_DOMINIO_DEPENDENCIAS: {
    json: "grafo_classes_dominios_dependencias.json",
    tipoGrafico: TipoGrafico.GRAFO_CLASSES_DOMINIO_DEPENDENCIAS,
  },
  CIRCLE_PACKING_DOMINIO: {
    json: "circulo_dominio_classes.json",
    tipoGrafico: TipoGrafico.CIRCLE_PACKING_DOMINIO,
  },
  CIRCLE_PACKING_DIRETORIO: {
    json: "circulo_diretorios_classes.json",
    tipoGrafico: TipoGrafico.CIRCLE_PACKING_DIRETORIO,
  },
};

function trocarGrafico(grafico_data) {
  d3.json(grafico_data.json)
    .then(function (data) {
      switch (grafico_data.tipoGrafico) {
        case GRAFO_COMPLETO:
          result = window.confirm(
            "Deseja realmente carregar o grafo completo? Ele pode exigir muitos recursos da máquina.",
          );
          if (result) {
            criarGraficoGrafoGeneralista(data);
          }
          break;
        case GRAFO_DOMINIO:
        case GRAFO_CLASSES_DOMINIO:
        case GRAFO_CLASSES_DOMINIO_DEPENDENCIAS:
          criarGraficoGrafoGeneralista(data);
          break;

        case CIRCLE_PACKING_DOMINIO:
          criarGraficoCirclePackingGeneralista(data);
          break;

        case CIRCLE_PACKING_DIRETORIO:
          criarCirclePackingDiretorios(data);
          break;

        default:
          criarCirclePackingDiretorios(data);
          break;
      }
    })
    .catch(function (error) {
      console.error("Erro ao carregar os dados:", error);
    });
}

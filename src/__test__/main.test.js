const app = require("../main")
const { suma, calculoRepuestos, tarifaTotal } = require("../calculos")

const repuestos = require("../datos/repuestos.json");
const mecanicos = require("../datos/data.json");
describe('Health', () => {
    it('Test para ver si corre jest', async () => {
        expect(1).toEqual(1);
    })
})

describe('Calculos', () => {
    it('Suma de dos numeros', async () => {
        const suma1 = suma(1, 3)
        expect(suma1).toEqual(4);
    })

    it('Calculo repuestos', async () => {
        const calculo = calculoRepuestos(repuestos)
        expect(calculo).toEqual(134500);
    })
    it('Prueba unitaria tarifa total', async () => {
        const cr = calculoRepuestos(repuestos);
        const vhm = mecanicos[1]["price_hour"]
        const final = tarifaTotal(vhm, 2.5, cr)
        expect(final).toEqual(134687.5);
    })

})

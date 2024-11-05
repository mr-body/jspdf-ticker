const express = require('express');
const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const app = express();
const port = 5000;

// Rota para servir a imagem do logo
app.use(express.static(path.join(__dirname, 'public')));

// Rota para gerar o ticket
app.get('/', async (req, res) => {
    const doc = new jsPDF({
        unit: 'mm',        // Unidades em milímetros
        format: [210, 100] // Tamanho mais razoável para um ticket de compra
    });

    // Informações do ticket
    const cliente = "João da Silva";
    const itens = [
        { nome: "Produto 1", preco: "R$ 20,00" },
        { nome: "Produto 2", preco: "R$ 35,00" },
        { nome: "Produto 3", preco: "R$ 45,00" },
        { nome: "Produto 1", preco: "R$ 20,00" },
        { nome: "Produto 2", preco: "R$ 35,00" },
        { nome: "Produto 3", preco: "R$ 45,00" },
        { nome: "Produto 1", preco: "R$ 20,00" },
        { nome: "Produto 1", preco: "R$ 20,00" },
    ];
    const total = "R$ 100,00";
    const data = new Date().toLocaleDateString("pt-BR");

    // Definindo a cor de fundo
    doc.setFillColor(240, 240, 240); // Cor de fundo
    doc.rect(0, 0, 120, 40, 'F');  // Preencher com a cor de fundo (formato A4 pequeno)

    // Ler a imagem logo.png e convertê-la para base64
    const logoPath = path.join(__dirname, 'public', 'logo.png');
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

    // Adicionar a imagem base64 ao PDF
    doc.addImage(`data:image/png;base64,${logoBase64}`, 'PNG', 8, 10, 10, 10);

    // Cabeçalho com título
    doc.setFontSize(18);
    doc.setTextColor(0, 10, 204); // Cor azul
    doc.text("Recibo de Compra", 35, 30, null, null, "center");

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Cor preta
    doc.text(`Cliente: ${cliente}`, 10, 50);
    doc.text(`Data: ${data}`, 10, 60);
    doc.text("Itens comprados:", 10, 70);

    let y = 80;
    // Listando os itens
    itens.forEach(item => {
        doc.text(`${item.nome}:\t\t ${item.preco}`, 10, y);
        y += 6;
    });

    // Total
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0); // Cor vermelha para o total
    doc.text(`Total: ${total}`, 10, y + 10);

    // Linha de separação
    doc.setDrawColor(0, 0, 0); // Cor preta
    doc.line(10, y + 20, 90, y + 20);    // Linha de 190mm de largura

    // Mensagem de agradecimento
    doc.setFontSize(10);
    doc.setTextColor(0, 102, 204); // Cor azul
    doc.text("Obrigado pela sua compra!", 10, y + 30);

    // Gerar QR code
    const qrData = "https://www.example.com";  // Dados do QR code
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        // Adicionar o QR code ao final do ticket
        const qrWidth = 30;  // Largura do QR code
        const qrHeight = 30; // Altura do QR code
        doc.addImage(qrCodeDataUrl, 'PNG', 7, y + 40, qrWidth, qrHeight);  // Ajuste a posição conforme necessário

        // Gerar PDF em um buffer e enviar ao cliente
        const pdfBuffer = doc.output('arraybuffer');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
        res.send(Buffer.from(pdfBuffer));
    } catch (err) {
        console.error("Erro ao gerar QR Code:", err);
        res.status(500).send("Erro ao gerar QR Code.");
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

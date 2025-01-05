"use strict";
class FB2Reader {
    constructor() {
        var _a;
        this.contents = new Document();
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.soportaAPIFile = true;
        }
        else {
            (_a = document.querySelector("h2")) === null || _a === void 0 ? void 0 : _a.insertAdjacentHTML("afterend", "<p>Este navegador no soporta el API File</p>");
            this.soportaAPIFile = false;
        }
    }
    readInputFile(file) {
        var _a, _b;
        (_a = document.querySelector("input + section")) === null || _a === void 0 ? void 0 : _a.remove();
        const sectionElement = document.createElement("section");
        (_b = document.querySelector("input")) === null || _b === void 0 ? void 0 : _b.after(sectionElement);
        const archivo = file;
        const extension = archivo.name.split(".").pop();
        if (extension === "fb2") {
            const reader = new FileReader();
            reader.onload = (evento) => {
                this.contents = this.parseXml(reader.result);
                this.processFile();
            };
            reader.readAsText(archivo);
        }
        else {
            sectionElement.innerHTML += "<p>Error: El archivo indicado no es de tipo FB2</p>";
        }
    }
    parseXml(xmlString) {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml");
    }
    processFile() {
        this.processDocumentDescription(this.contents.querySelector("description"));
        this.processDocumentContents(this.contents.querySelector("body"));
    }
    processDocumentDescription(fileDescription) {
        var _a, _b, _c, _d, _e, _f;
        if (!fileDescription)
            return;
        const sectionElement = document.createElement("section");
        document.body.appendChild(sectionElement);
        const documentDataSection = sectionElement;
        documentDataSection.innerHTML = "<h3>Datos del texto</h3>";
        const authorData = fileDescription.querySelector("title-info > author");
        let authorName = "";
        if (authorData) {
            authorName += (((_a = authorData.querySelector("first-name")) === null || _a === void 0 ? void 0 : _a.textContent) || "");
            authorName += (authorData.querySelector("middle-name") ? " " + ((_b = authorData.querySelector("middle-name")) === null || _b === void 0 ? void 0 : _b.textContent) + " " : " ");
            authorName += (((_c = authorData.querySelector("last-name")) === null || _c === void 0 ? void 0 : _c.textContent) || "");
        }
        documentDataSection.innerHTML += `<h4>Autor:</h4><p>${authorName}</p>`;
        const titleElement = fileDescription.querySelector("title-info > book-title");
        documentDataSection.innerHTML += "<h4>Título:</h4>";
        documentDataSection.innerHTML += titleElement ? `<p>${titleElement.textContent}</p>` : "<p>El texto no tiene título</p>";
        const genre = ((_d = fileDescription.querySelector("title-info > genre")) === null || _d === void 0 ? void 0 : _d.textContent) || "";
        documentDataSection.innerHTML += `<h4>Género:</h4><p>${genre.charAt(0).toUpperCase() + genre.slice(1)}</p>`;
        const publisher = ((_e = fileDescription.querySelector("publish-info > publisher")) === null || _e === void 0 ? void 0 : _e.textContent) || "El texto no tiene editor";
        documentDataSection.innerHTML += `<h4>Editor:</h4><p>${publisher}</p>`;
        const year = ((_f = fileDescription.querySelector("publish-info > year")) === null || _f === void 0 ? void 0 : _f.textContent) || "El texto no tiene año de publicación";
        documentDataSection.innerHTML += `<h4>Año:</h4><p>${year}</p>`;
    }
    processDocumentContents(bodyContents) {
        if (!bodyContents)
            return;
        const documentContentsSection = document.createElement("section");
        const sectionTitle = document.createElement("h4");
        sectionTitle.innerHTML = "Contenido";
        documentContentsSection.append(sectionTitle);
        document.body.appendChild(documentContentsSection);
        bodyContents.querySelectorAll("emphasis").forEach((element) => {
            const em = document.createElement("em");
            em.innerHTML = element.innerHTML;
            element.replaceWith(em);
        });
        bodyContents.querySelectorAll("strong").forEach((element) => {
            const b = document.createElement("b");
            b.innerHTML = element.innerHTML;
            element.replaceWith(b);
        });
        bodyContents.querySelectorAll("p").forEach((textElement) => {
            const p = document.createElement("p");
            p.innerHTML = textElement.innerHTML;
            documentContentsSection.appendChild(p);
        });
    }
}

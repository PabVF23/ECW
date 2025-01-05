class FB2Reader {
    private contents: Document
    private soportaAPIFile: boolean

    constructor() {
        this.contents = new Document()
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.soportaAPIFile = true;
        } else {
            document.querySelector("h2")?.insertAdjacentHTML("afterend", "<p>Este navegador no soporta el API File</p>");
            this.soportaAPIFile = false;
        }
    }

    public readInputFile(file: File): void {
        document.querySelector("input + section")?.remove();
        const sectionElement = document.createElement("section");
        document.querySelector("input")?.after(sectionElement);

        const archivo = file;
        const extension = archivo.name.split(".").pop();

        if (extension === "fb2") {
            const reader = new FileReader();
            reader.onload = (evento) => {
                this.contents = this.parseXml(reader.result as string);
                this.processFile();
            };
            reader.readAsText(archivo);
        } else {
            sectionElement.innerHTML += "<p>Error: El archivo indicado no es de tipo FB2</p>";
        }
    }

    private parseXml(xmlString: string): Document {
        const parser = new DOMParser();
        return parser.parseFromString(xmlString, "application/xml")
    }

    private processFile(): void {
        this.processDocumentDescription(this.contents.querySelector("description"))
        this.processDocumentContents(this.contents.querySelector("body"))
    }

    private processDocumentDescription(fileDescription: Element | null): void {
        if (!fileDescription) return;

        const sectionElement = document.createElement("section");
        document.body.appendChild(sectionElement);
        const documentDataSection = sectionElement;

        documentDataSection.innerHTML = "<h3>Datos del texto</h3>";

        const authorData = fileDescription.querySelector("title-info > author");
        let authorName = "";

        if (authorData) {
            authorName += (authorData.querySelector("first-name")?.textContent || "");
            authorName += (authorData.querySelector("middle-name") ? " " + authorData.querySelector("middle-name")?.textContent + " " : " ");
            authorName += (authorData.querySelector("last-name")?.textContent || "");
        }

        documentDataSection.innerHTML += `<h4>Autor:</h4><p>${authorName}</p>`;

        const titleElement = fileDescription.querySelector("title-info > book-title");
        documentDataSection.innerHTML += "<h4>Título:</h4>";
        documentDataSection.innerHTML += titleElement ? `<p>${titleElement.textContent}</p>` : "<p>El texto no tiene título</p>";

        const genre = fileDescription.querySelector("title-info > genre")?.textContent || "";
        documentDataSection.innerHTML += `<h4>Género:</h4><p>${genre.charAt(0).toUpperCase() + genre.slice(1)}</p>`;

        const publisher = fileDescription.querySelector("publish-info > publisher")?.textContent || "El texto no tiene editor";
        documentDataSection.innerHTML += `<h4>Editor:</h4><p>${publisher}</p>`;

        const year = fileDescription.querySelector("publish-info > year")?.textContent || "El texto no tiene año de publicación";
        documentDataSection.innerHTML += `<h4>Año:</h4><p>${year}</p>`;
    }

    private processDocumentContents(bodyContents: Element | null): void {
        if (!bodyContents) return;

        const documentContentsSection = document.createElement("section");

        const sectionTitle = document.createElement("h4")
        
        sectionTitle.innerHTML = "Contenido"

        documentContentsSection.append(sectionTitle)

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
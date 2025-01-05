class Procesador {
    constructor() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.soportaAPIFile = true;
        } else {
            $("h2").after("<p>Este navegador no soporta el API File</p>")
            this.soportaAPIFile = false;
        }
    }

    readInputFile(file) {
        $("input + section").remove()
        $($("input")).after("<section></section>")

        let archivo = $("input").prop("files")[0];
        let lector = this

        if (archivo.name.split(".").at(-1) === "xml") {
            let reader = new FileReader();
            reader.onload = function(evento) {
                let contents = $.parseXML(reader.result);
                lector.processContents(contents)
            }

            reader.readAsText(archivo);
        } else {
            $("section").append("<p>Error: El archivo indicado no es de tipo XML<p>")
        }
    }

    processContents(fileContents) {

        var contentsSection = $("section")

        var procesador = this

        var elementos = $(fileContents).find("elemento")

        var elementosAnidados = $(elementos).find("elemento")

        elementos = elementos.not(elementosAnidados)

       elementos.each(function() {
            var tipo = $(this).attr("xsi:type")

            switch (tipo) {
                case "titulo":
                    var nivel = $(this).attr("nivel")
                    var contenido = $(this).find("contenido").text()
                    $(contentsSection).append(`<h${nivel}>${contenido}</h${nivel}>`);
                    break;

                case "imagen":
                    var ruta = $(this).attr("ruta")
                    var alt = $(this).attr("alt")
                    $(contentsSection).append(`<img src="${ruta}" alt="${alt}"/>`);
                    break;

                case "lista":
                    var tipo = $(this).attr('tipo');
                    var tag = tipo === 'ordenada' ? 'ol' : 'ul';
                    var $lista = $(`<${tag}></${tag}>`);

                    $(this).find('elemento').each(function () {
                        $lista.append(`<li>${$(this).text()}</li>`);
                    });

                    $(contentsSection).append($lista);
                    break;

                case "seccion":
                    var $seccion = procesador.createSection(this)

                    $(contentsSection).append($seccion)
                    break;

                default:
                    var contenido = $(this).find("contenido").text()
                    $(contentsSection).append(`<p>${contenido}</p>`);
                    break;
            }
        })
    }

    createSection(section) {
        var $seccion = $("<section></section>")

        $(section).children("elemento").each(function() {
            var tipo = $(this).attr("xsi:type")

            switch (tipo) {
                case "titulo":
                    var nivel = $(this).attr("nivel")
                    var contenido = $(this).find("contenido").text()
                    $seccion.append(`<h${nivel}>${contenido}</h${nivel}>`);
                    break;

                case "imagen":
                    var ruta = $(this).attr("ruta")
                    var alt = $(this).attr("alt")
                    $seccion.append(`<img src="${ruta}" alt="${alt}"/>`);
                    break;

                case "lista":
                    var tipo = $(this).attr('tipo');
                    var tag = tipo === 'ordenada' ? 'ol' : 'ul';
                    var $lista = $(`<${tag}></${tag}>`);

                    $(this).find('elemento').each(function () {
                        $lista.append(`<li>${$(this).text()}</li>`);
                    });

                    $seccion.append($lista);
                    break;

                case "seccion":
                    $seccion = createSection(this)
                    break;

                default:
                    var contenido = $(this).find("contenido").text()
                    $seccion.append(`<p>${contenido}</p>`);
                    break;
            }
        })

        return $seccion
    }
}
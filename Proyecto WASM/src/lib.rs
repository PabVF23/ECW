use wasm_bindgen::prelude::*;
use web_sys::{FileReader, ProgressEvent};
use std::cell::RefCell;
use std::rc::Rc;
use xml::reader::{EventReader, XmlEvent};

#[wasm_bindgen]
pub fn read_input_file(file: &web_sys::File) {
    let reader = Rc::new(RefCell::new(FileReader::new().unwrap()));

    let reader_clone = Rc::clone(&reader);

    let closure = Closure::wrap(Box::new(move |e: ProgressEvent| {
        let reader_ref = reader_clone.borrow();
        
        if let Ok(result) = reader_ref.result() {
            if let Some(result_str) = result.as_string() {
                parse_xml_document(&result_str);
            }
        }
    }) as Box<dyn FnMut(ProgressEvent)>);

    reader.borrow().set_onload(Some(closure.as_ref().unchecked_ref()));
    closure.forget();

    reader.borrow().read_as_text(file).unwrap();
}

fn parse_xml_document(xml_string: &str) {
    let parser = web_sys::DomParser::new().unwrap();

    match parser.parse_from_string(xml_string, web_sys::SupportedType::ApplicationXml) {
        Ok(doc) => {
            process_fb2_document(&doc);
        }
        Err(err) => {
            web_sys::console::error_1(&err);
        }
    }
}

fn process_fb2_document(doc: &web_sys::Document) {
    process_document_description(doc.query_selector("description").unwrap().as_ref());
    process_document_contents(doc.query_selector("body").unwrap().as_ref());
}

fn process_document_description(file_description: Option<&web_sys::Element>) {
    if file_description.is_none() {
        return;
    }

    let file_description = file_description.unwrap();
    let section_element = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .create_element("section")
        .unwrap();

    web_sys::window().unwrap().document().unwrap().body().unwrap().append_child(&section_element).unwrap();

    section_element.set_inner_html("<h3>Datos del texto</h3>");

    if let Some(author_data) = file_description.query_selector("title-info > author").unwrap() {
        let mut author_name = String::new();

        if let Some(first_name) = author_data.query_selector("first-name").unwrap() {
            author_name.push_str(&first_name.text_content().unwrap_or_default());
        }
        if let Some(middle_name) = author_data.query_selector("middle-name").unwrap() {
            author_name.push_str(&format!(" {} ", middle_name.text_content().unwrap_or_default()));
        } else {
            author_name.push_str(" ");
        }
        if let Some(last_name) = author_data.query_selector("last-name").unwrap() {
            author_name.push_str(&last_name.text_content().unwrap_or_default());
        }

        section_element.set_inner_html(&format!("{}<h4>Autor:</h4><p>{}</p>", section_element.inner_html(), author_name));
    }

    if let Some(title_element) = file_description.query_selector("title-info > book-title").unwrap() {
        section_element.set_inner_html(&format!("{}<h4>Título:</h4><p>{}</p>", section_element.inner_html(), title_element.text_content().unwrap_or_default()));
    } else {
        section_element.set_inner_html(&format!("{}<h4>Título:</h4><p>El texto no tiene título</p>", section_element.inner_html()));
    }

    let genre = file_description.query_selector("title-info > genre").unwrap().and_then(|e| e.text_content()).unwrap_or_default();
    section_element.set_inner_html(&format!("{}<h4>Género:</h4><p>{}</p>", section_element.inner_html(), capitalize_first_letter(&genre)));

    let publisher = file_description.query_selector("publish-info > publisher").unwrap().and_then(|e| e.text_content()).unwrap_or("El texto no tiene editor".to_string());
    section_element.set_inner_html(&format!("{}<h4>Editor:</h4><p>{}</p>", section_element.inner_html(), publisher));

    let year = file_description.query_selector("publish-info > year").unwrap().and_then(|e| e.text_content()).unwrap_or("El texto no tiene año de publicación".to_string());
    section_element.set_inner_html(&format!("{}<h4>Año:</h4><p>{}</p>", section_element.inner_html(), year));
}

fn process_document_contents(body_contents: Option<&web_sys::Element>) {
    if body_contents.is_none() {
        return;
    }

    let body_contents = body_contents.unwrap();
    let document_contents_section = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .create_element("section")
        .unwrap();

    web_sys::window().unwrap().document().unwrap().body().unwrap().append_child(&document_contents_section).unwrap();

    let h4 = web_sys::window()
        .unwrap()
        .document()
        .unwrap()
        .create_element("h4")
        .unwrap();
    h4.set_inner_html("Contenido");
    document_contents_section.append_child(&h4).unwrap();

    let emphasis_elements = body_contents.query_selector_all("emphasis").unwrap();
    for i in 0..emphasis_elements.length() {
        if let Some(element) = emphasis_elements.item(i) {
            let element = element.dyn_into::<web_sys::Element>().unwrap();
            
            let em = web_sys::window()
                .unwrap()
                .document()
                .unwrap()
                .create_element("em")
                .unwrap();

            em.set_inner_html(&element.inner_html());
            element.replace_with_with_node_1(&em).unwrap();
        }
    }

    let strong_elements = body_contents.query_selector_all("strong").unwrap();
    for i in 0..strong_elements.length() {
        if let Some(element) = strong_elements.item(i) {
            let element = element.dyn_into::<web_sys::Element>().unwrap();
            

            let b = web_sys::window()
                .unwrap()
                .document()
                .unwrap()
                .create_element("b")
                .unwrap();

            b.set_inner_html(&element.inner_html());
            element.replace_with_with_node_1(&b).unwrap();
        }
    }

    // Process <p> elements
    let paragraphs = body_contents.query_selector_all("p").unwrap();
    for i in 0..paragraphs.length() {
        if let Some(paragraph) = paragraphs.item(i) {
            let paragraph = paragraph.dyn_into::<web_sys::Element>().unwrap();

            let p = web_sys::window()
                .unwrap()
                .document()
                .unwrap()
                .create_element("p")
                .unwrap();

            p.set_inner_html(&paragraph.inner_html());
            document_contents_section.append_child(&p).unwrap();
        }
    }

    // let paragraphs = body_contents.query_selector_all("p").unwrap();
    // for i in 0..paragraphs.length() {
    //     if let Some(text_element) = paragraphs.item(i) {
    //         let text_element = text_element.dyn_into::<web_sys::Element>().unwrap();
    //         let p = web_sys::window()
    //             .unwrap()
    //             .document()
    //             .unwrap()
    //             .create_element("p")
    //             .unwrap();

    //         p.set_inner_html(&text_element.inner_html());
    //         document_contents_section.append_child(&p).unwrap();
    //     }
    // }
}

fn capitalize_first_letter(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

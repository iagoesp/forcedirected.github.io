let countNodeTable = 0;     // contador para criar vértices com ids numeráveis através do click do botão "Inserir vértice"
let arr_namesNode = [];     // array para guardar nós com id distintos
let arr_namesLinks = [];    // array para guardar nós com links distintos
let json_nodes = [];        // array para guardar palavra para adicionar no json final
let json_links = [];        // array para guardar palavra para adicionar no json final
let gerarJson = {};         // arquivo final antes de gerar a interface gráfica do grafo
let disabled = false;       // define se o input fixo foi chamado ou não


// Define o tamanho da janela que o grafo será renderizado
var width = window.innerWidth-100, height = window.innerHeight-200;

// Seleciona o elemento do documento HTML e adiciona o elemento SVG
var svg = d3.select("body").append("svg")
  .attr('width', width)
  .attr('height', height);

  $('svg').attr('id', 'svgCanvas');

// Define o esquema de cores que vão definir nos nós
var color = d3.scaleOrdinal(d3.schemeCategory20);

// Define o ambiente para a simulação de força 
var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width/2 , height/2));

// ----------------------------------------------------------------------------------------------------------------------- //
// Funcão da opção de inserir manualmente os vértices ao clicar no botão "nserir vértice"
$("#inserirNodesManual").click(function() {
  let nameNode = $("#nameNode").val();          // Copia o input da descrição do nó e atribui a essa variável
  let groupNode = $("#groupNode").val();        // Copia o input da descrição do grupo associado ao nó e atribui a essa variável


  // checa se o input é válido, verifica se é um valor único ou é um conjunto de valores caso positivo, cria um parser e 
  // cria um dict para cada um para salvar depois e cria uma visualização na tabela contendo uma lista do que está sendo inserido

  // Checa se o nó foi inserido manualmente ou apertado pelo botão de inserir nó Caso seja, checa também se é um 
  // conjunto de valores que foi passado ou foi único. A partir disso, ele insere os valors dos nós na tabela e salva em um array para passar
  // para o render ao clicar no botão de "Gerar Grafo"
  
  // Há três meios de adicionar. A primeira é adicionar um id único e, opcionalmente, e o valor do grupo em que cada nó está atribuído
  // Por exemplo: "Node1" no campo de vértices e "1" no campo de grupo
  // O segundo é adicionar um conjunto de valores tanto para os ids dos nós quanto para o valor de cada conjunto de grupo.
  // Para ambos esses campos, deve-se separar com vírgulas.
  // Por exemplo, "Node1,Node2,Node3,Node4"
  // O outro e o último meio é adicionando os vértices clicando diretamente no botão "Inserir vértices", criando um id numeral natural

  if(nameNode){
    let nodeSplit = nameNode.split(",");
    if(nodeSplit.length > 1){
      let cont = 0;
      let groupSplit = groupNode.split(",");
      nodeSplit.forEach(element => {
        let row = '';
        if(!arr_namesNode.includes(element) && element != 0){
            let item = {};
            item["id"] = element;

            row += '<tr class="rowDelete"><td>'+ element + '</td>';
            // checa se é um número natural
            if(groupSplit[cont]){
              if(!isNaN(groupSplit[cont])){
                item["group"] = groupSplit[cont];
                row += '<td>' + groupSplit[cont] + '</td>';
              }
              else{
                alert(groupSplit[cont] + " não é um número natural.")
              }
            }
          else{
            row += '<td></td>';
          }

          json_nodes.push(item);
          
          arr_namesNode.push(element);
          // seta se o botão para deletar nós e links está desativado ou não
          if(disabled){
            row += '<td><input class="btn btn-light delete" type="button" id="node-' + nameNode + '" value="Delete" onclick="deleteRowNode(this)" disabled/></td></tr>';
          }
          else{
            row += '<td><input class="btn btn-light delete" type="button" id="node-' + nameNode + '" value="Delete" onclick="deleteRowNode(this)"/></td></tr>';
          }
          $("#tableNodes tbody").append(row);
          
          if(element == String(countNodeTable)){
            countNodeTable++;
          }
        }
        $("#nameNode").val("");
        $("#groupNode").val("");
        cont++;
      });
    }
    else{
      let row = '';
      let element = nameNode;
      if(!arr_namesNode.includes(element) && element != 0){
          let item = {};
          item["id"] = element;

          row += '<tr class="rowDelete"><td>'+ element + '</td>';
          if(groupNode){
            if(!isNaN(groupNode)){
              item["group"] = groupNode;
              row += '<td>' + groupNode + '</td>';
            }
            else{
              alert(groupNode + " não é um número natural.")
            }
          }
        else{
          row += '<td></td>';
        }

        json_nodes.push(item);
        
        arr_namesNode.push(element);
        row += '<td><input class="btn btn-light delete" type="button" id="node-' + nameNode + '" value="Delete" onclick="deleteRowNode(this)"/></td></tr>';
        $("#tableNodes tbody").append(row);
        
        if(element == String(countNodeTable)){
          countNodeTable++;
        }
      }        
      $("#nameNode").val("");
    }
  }
  // se não houver input, ele gera vértices com id a partir do contador definido acima. assim, ele também salva o id em um dict e exibe na tela
  else{
    let item = {};
    item["id"] = String(countNodeTable);
    json_nodes.push(item);

    let row = '';
    console.log("count");
    row += '<tr class="rowDelete"><td>'+ countNodeTable + '</td>';
    row += '<td></td>';
    arr_namesNode.push(String(countNodeTable));
    
    // seta se o botão para deletar nós e links está desativado ou não
    if(disabled){
      row += '<td><input class="btn btn-light delete" type="button" id="node-' + countNodeTable + '" value="Delete" onclick="deleteRowNode(this)" disabled/></td></tr>';
    }
    else{
      row += '<td><input class="btn btn-light delete" type="button" id="node-' + countNodeTable + '" value="Delete" onclick="deleteRowNode(this)"/></td></tr>';
    }
    countNodeTable++;
      
    $("#tableNodes tbody").append(row);
  }
});

// Seguindo a mesma lógica da função acima, ao clicar no botão "Inserir Links" ele vai adicionar o valor que está no campo ao lado.
// A estrutura é do vértice da origem ao próximo vértice. Por exemplo "Node1,Node2"
// Ao inserir um conjunto de valores, deve-se separar com ponto-e-virgula ";". Por exemplo: "Node1,Node2;Node1,Node3;Node2,Node3"
$("#inserirLinks").click(function() {
  let nameLink = $("#nameLink").val();
  let linkSplit = nameLink.split(";");

  if(linkSplit.length > 1){
    linkSplit.forEach(nameLink => {
      linkSplit = nameLink.split(",");
      source = String(linkSplit[0]);
      target = String(linkSplit[1]);
      row = '';
      // se o link é válido e não possui outro link duplicado
      if(nameLink && !arr_namesLinks.includes(nameLink) && arr_namesNode.includes((source)) && arr_namesNode.includes((target))){
        let item = {};
        item["source"] = source;
        item["target"] = target;
        json_links.push(item);

        row += '<tr class="rowDelete"><td value="' + source + '">'+ source + '</td>';
        row += '<td value="' + target + '">'+ target + '</td>';
        // seta se o botão para deletar nós e links está desativado ou não
        if(disabled){
          row += '<td><input class="btn btn-light delete" type="button" id="link-' + source + '-' + target + '" value="Delete" onclick="deleteRowLink(this)" disabled/></td></tr>';
        }
        else{
          row += '<td><input class="btn btn-light delete" type="button" id="link-' + source + '-' + target + '" value="Delete" onclick="deleteRowLink(this)"/></td></tr>';
        }

        
        //adiciona os valores do link em "Source" e em "Target" e nos arrays e permite gerar o grafo
        arr_namesLinks.push((nameLink));
        $("#tableLinks tbody").append(row);
        $("#nameLink").val("");
        $("#gerarManual").prop("disabled", false );
      }
    });
  }
  else{
    linkSplit = nameLink.split(",");
    let source = String(linkSplit[0]);
    let target = String(linkSplit[1]);
    let row = '';
    
    // se o link é válido e não possui outro link duplicado
    if(nameLink && !arr_namesLinks.includes(nameLink) && arr_namesNode.includes((source)) && arr_namesNode.includes((target))){
      let item = {};
      item["source"] = source;
      item["target"] = target;
      json_links.push(item);

      row += '<tr class="rowDelete"><td value="' + source + '">'+ source + '</td>';
      row += '<td value="' + target + '">'+ target + '</td>';
      if(disabled){
        row += '<td><input class="btn btn-light delete" type="button" id="link-' + source + '-' + target + '" value="Delete" onclick="deleteRowLink(this)"/></td></tr>';
      }
      else{
        row += '<td><input class="btn btn-light delete" type="button" id="link-' + source + '-' + target + '" value="Delete" onclick="deleteRowLink(this)"/></td></tr>';
      }

      //adiciona os valores do link em "Source" e em "Target" e permite gerar o grafo
      arr_namesLinks.push((nameLink));
      $("#tableLinks tbody").append(row);
      $("#nameLink").val("");
      $("#gerarManual").prop("disabled", false );
    }
  }
});

function findRows(id){
  console.log("findRows");
  json_links.forEach(element => {
    console.log(element)
    
    if(element["source"] == id){
      console.log("encontrou link")

      let item = json_links.indexOf(element);
      console.log(item);

      json_links.splice(item, 1);
      //deleteRow(document.getElementById("link-" + element["source"]+"-"+element["target"]))

      let btn = document.getElementById("link-" + element["source"]+"-"+element["target"])
      let row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
    if(element["target"] == id){
      console.log("encontrou link")

      let item = json_links.indexOf(element);
      console.log(item);

      json_links.splice(item, 1);
      //deleteRow(document.getElementById("link-" + element["source"]+"-"+element["target"]));

      let btn = document.getElementById("link-" + element["source"]+"-"+element["target"])
      let row = btn.parentNode.parentNode;
      row.parentNode.removeChild(row);
    }
  });
}

// deleta a linha da tabela dos links respectiva ao botão "Deletar"  e os elementos respectivos do link ao clicar no botão
function deleteRowLink(btn){
  console.log(" ");
  console.log("> deleteRowLink");
  console.log("btn id " + btn.id);
  let row = btn.parentNode.parentNode;
  
  let source = row.childNodes[0].innerText;
  let target = row.childNodes[1].innerText;

  for(let i = 0; i< json_links.length; i++){
    let element = json_links[i];
    console.log("> for link");
    console.log("element ");
    console.log(element);
    
    if(element["source"] == source && element["target"] == target){
      console.log("* encontrou link")

      let item = json_links.indexOf(element);
      console.log("index" + item);

      json_links.splice(item, 1);
    }
  };
  
  row.parentNode.removeChild(row);
  /*
  try{
    console.log("remove row" );
    console.log(row);
  }
  catch(e){
    console.log("error");
    console.log(e);
  }
  */
  
}
// deleta a linha da tabela de vértices respectiva ao botão "Deletar" e os elementos respectivos do vértice ao clicar no botão
function deleteRowNode(btn){
  console.log(" ");
  console.log("> deleteRowNode");
  console.log("btn id " + btn.id);
  let row = btn.parentNode.parentNode;
  let btnid = btn.id.split('-');

  console.log("> btn node");  
  let id = btnid[1];
  console.log("id " + id);

  findJsonNodes(id);  
  
  row.parentNode.removeChild(row);
  /*
  try{
    console.log("remove row" );
    console.log(row);
  }
  catch(e){
    console.log("error");
    console.log(e);
  }*/
  
}

// botão de gerar o Grafo
$("#gerarManual").click(function() {
  gerarJson["nodes"] = json_nodes;
  gerarJson["links"] = json_links;
  console.log(gerarJson.links);

  render(gerarJson);
});

// função que instância os vértices, as arestas e define algumas características do ambiente 
function render(js){
  graph = js;

  // Cria as arestas que foram adicionadas na estrutura de dados, passando os paramêtros abaixos para o elemento SVG
  var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", 1);

  // Cria os vértices que foram adicionadas na estrutura de dados, passando para as informações o elemento SVG
  var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("g");
  
  // Atribui características aos vértices 
  var circles = node.append("circle")
      .attr("r", 7)
      .attr("fill", function(d) { return color(d.group); })
      .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Atribui o texto aos vértices 
  var lables = node.append("text")
    .text(function(d) {
      return d.id;
    })
    .attr('x', 7)
    .attr('y', 0);

  //atribui ao espaço de simulação os vertices ja criados e passa a função de 
  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  
  simulation.force("link")
    .links(graph.links);

  let created = false;
  ticked();
  function ticked() {
    if(!created){
      node
        .attr("transform", function(d) {
          return "translate(" + width/2 + "," + height/2 + ")";
        })
        created=true;
    }
    else{
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          })
    }
  }
};

// funções relacionadas ao movimento do nó correspondendo a simulação
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// apagar o input
$("#resetDraw").click(function() {
  location.reload();
});


// configurando botões para desativar ao clicar no botão de gerar o grafo
$("#gerarManual").click(function(){
  if(json_links.length > 0 && json_nodes.length > 0){
    $("#inserirNodesManual").prop("disabled", true );
    $("#inserirLinks").prop("disabled", true );
    $("#gerarManual").prop("disabled", true );
  }
})

// do bootstrap
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// processamento do primeiro input fixo 
$("#inputFixo1").click(function(){
  $("svg").empty();
  $(".rowDelete").each(function(){
    this.remove();
  })
  countNodeTable = 0;     
  arr_namesNode = [];     
  arr_namesLinks = [];    
  json_nodes = [];        
  json_links = [];        
  gerarJson = {};  

  let nodes = "1,2,3,4,5,6";
  let group = "1,1,1,2,2,3";
  let links = "1,2;1,3;3,4;3,5;5,6"
  $("#nameNode").val(nodes);
  $("#groupNode").val(group);
  setTimeout(function(){
    disabled = true;
    $("#inserirNodesManual").click();
  }, 1500);
  
  $("#nameLink").val(links);
  setTimeout(function(){
    $("#inserirLinks").click();
  }, 3000);
  setTimeout(function(){
    $("#gerarManual").click();
  }, 4500);
  
});

// processamento do segundo input fixo 
$("#inputFixo2").click(function(){
  $("svg").empty();
  $(".rowDelete").each(function(){
    this.remove();
  })
  countNodeTable = 0;     
  arr_namesNode = [];     
  arr_namesLinks = [];    
  json_nodes = [];        
  json_links = [];        
  gerarJson = {};        

  let nodes = "Myriel,Napoleon,CountessdeLo,Simplice,Gribier,Babet,Javert,Brevet";
  let group = "1,1,1,2,2,3,3,3";
  let links = "Napoleon,Myriel;CountessdeLo,Myriel;Simplice,Javert;Simplice,Gribier;Brevet,CountessdeLo;CountessdeLo,Babet;Myriel,Simplice"
  $("#nameNode").val(nodes);
  $("#groupNode").val(group);
  setTimeout(function(){
    disabled = true;
    $("#inserirNodesManual").click();
  }, 1500);
  
  $("#nameLink").val(links);
  setTimeout(function(){
    $("#inserirLinks").click();
  }, 3000);
  setTimeout(function(){
    $("#gerarManual").click();
  }, 4500);
});

// função auxiliar para encontrar e remover elementos 
function findJsonNodes(id){
  let arr_aux = [];
  for(let i = 0; i < json_nodes.length; i++){
    console.log("> for nodes");
    
    let element = json_nodes[i];
    console.log("element ")
    console.log(element)

    if(element["id"] == id){
      console.log("* encontrou elemento")
      let item = json_nodes.indexOf(element);
      console.log(item);
      json_nodes.splice(item, 1);

      item = arr_namesNode.indexOf(id);
      console.log(item);
      arr_namesNode.splice(item, 1);

      console.log("> for link");
      for(let j =0; j < json_links.length; j++){
        console.log("element ")

        let element = json_links[j];
        console.log(element)
                
        if(element["source"] == id || element["target"] == id){
          console.log("* encontrou link")
          arr_aux.push(element);
        }

      };
      arr_aux.forEach(element => {
        console.log("item ")
        let item = json_links.indexOf(element);
        console.log(item);
    
        json_links.splice(item, 1);     
        let btn = document.getElementById("link-" + element["source"]+"-"+element["target"])
        console.log(element);
        deleteRowLink(btn);
      });
    }
  };
}

// ação para gerar o PDF
$("#gerarPDF").click(function(){
  $("#container").hide();
  window.print();
});
$("#voltar").click(function(){
  $("#container").show();
});
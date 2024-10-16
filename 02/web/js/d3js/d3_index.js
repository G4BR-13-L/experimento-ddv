const WINDOW_WIDTH = window.innerWidth;
const WINDOW_HEIGHT = window.innerHeight;

document.addEventListener("DOMContentLoaded", function () {
    d3.json(JsonData.CIRCLE_PACKING_DIRETORIO.json).then(function (data) {
        // criarGraficoCirclePackingGeneralista(data);
        criarCirclePackingDiretorios(data);
    }).catch(function (error) {
        console.error("Erro ao carregar os dados:", error);
    });
});


function criarGraficoGrafoGeneralista(data) {
    const width = WINDOW_WIDTH;
    const height = WINDOW_HEIGHT;

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-40))
        .force("center", d3.forceCenter(0, 0).strength(0.1))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    document.querySelector('.d3-canvas').innerHTML = "";
    const svg = d3.select(".d3-canvas").append("svg")
        .attr("class", "svg-view")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;")
        .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed))
        .append("g");

    const link = svg.append("g")
        .attr("stroke", "#333")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 0.1)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.1)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", d => d.tamanho ? d.tamanho : 5)
        .attr("fill", d => color(d.cor))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title").text(d => d.nome);

    const text = svg.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", -10)
        .attr("y", -10)
        .attr("dy", ".15em")
        .attr("font-size", "5px")
        .attr("font-family", "sans-serif")
        .attr("fill", "#9999")
        .text(d => d.nome);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        text
            .attr("x", d => d.x + 12)
            .attr("y", d => d.y + 8);
    });

    function zoomed(event) {
        svg.attr("transform", event.transform);
    }

    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return svg.node();
}

function criarGraficoCirclePackingGeneralista(data) {
    let width = 930;
    let height = width;

    let bold = true;
    let black = false;
    let shadow = true;
    let multicolor = true;
    let hexcolor = "#0099cc";


    // Compute the layout.
    const pack = data => d3.pack()
        .size([width, height])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));
    const root = pack(data);

    function setColorScheme(multi) {
        if (multi) {
            let color = d3.scaleOrdinal()
                .range(d3.schemeCategory10)
            return color;
        }
    }

    function setCircleColor(obj) {
        let depth = obj.depth;
        while (obj.depth > 1) {
            obj = obj.parent;
        }
        let newcolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
        newcolor.l += depth == 1 ? 0 : depth * .1;
        return newcolor;
    }

    function setStrokeColor(obj) {
        let depth = obj.depth;
        while (obj.depth > 1) {
            obj = obj.parent;
        }
        let strokecolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
        strokecolor.l += depth == 1 ? 0 : depth * .2;
        return strokecolor;
    }

    let color = setColorScheme(multicolor);


    // Clear the previous content in the .d3-canvas div.
    const canvas = document.querySelector('.d3-canvas');
    canvas.innerHTML = "";

    const svg = d3.create("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Centraliza o conteúdo horizontal e verticalmente
        .style("display", "block")
        .style("margin", "0 auto") // Centraliza horizontalmente
        .style("width", "100%")
        .style("height", "100vh")
        .style("background", "white")
        .style("cursor", "pointer")
        .on("click", () => zoom(root));
    // Append the SVG to the .d3-canvas div.
    canvas.appendChild(svg.node());

    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .enter().append("circle")
        .attr("fill", setCircleColor)
        .attr("stroke", setStrokeColor)
        .attr("pointer-events", d => !d.children ? "none" : null)
        .on("mouseover", function () { d3.select(this).attr("stroke", d => d.depth == 1 ? "black" : "white"); })
        .on("mouseout", function () { d3.select(this).attr("stroke", setStrokeColor); })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));


    const label = svg.append("g")
        .style("fill", function () {
            return black ? "black" : "white";
        })
        .style("text-shadow", function () {
            if (shadow) {
                return black ? "2px 2px 0px white" : "2px 2px 0px black";
            } else {
                return "none";
            }
        })
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .enter().append("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .style("font", d => "20px sans-serif")
        .style("font-weight", function () {
            return bold ? "bold" : "normal";
        })
        .text(d => d.data.name);

    // Create the zoom behavior and zoom immediately in to the initial focus node.
    svg.on("click", (event) => zoom(event, root));
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v) {
        const k = width / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

        label
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    return svg.node();
}

function criarCirclePackingDiretorios(data) {
    let width = 930;
    let height = width;

    let bold = true;
    let black = false;
    let shadow = true;
    let multicolor = true;
    let hexcolor = "#0099cc";


    // Compute the layout.
    const pack = data => d3.pack()
        .size([width, height])
        .padding(3)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));
    const root = pack(data);

    function setColorScheme(multi) {
        if (multi) {
            let color = d3.scaleOrdinal()
                .range(d3.schemeCategory10)
            return color;
        }
    }

    function setCircleColor(obj) {
        let depth = obj.depth;
        while (obj.depth > 1) {
            obj = obj.parent;
        }
        let newcolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
        newcolor.l += depth == 1 ? 0 : depth * .05;
        return newcolor;
    }

    function setStrokeColor(obj) {
        let depth = obj.depth;
        while (obj.depth > 1) {
            obj = obj.parent;
        }
        let strokecolor = multicolor ? d3.hsl(color(obj.data.name)) : d3.hsl(hexcolor);
        strokecolor.l += depth == 1 ? 0 : depth * .03;
        return strokecolor;
    }

    let color = setColorScheme(multicolor);


    // Clear the previous content in the .d3-canvas div.
    const canvas = document.querySelector('.d3-canvas');
    canvas.innerHTML = "";

    const svg = d3.create("svg")
        .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Centraliza o conteúdo horizontal e verticalmente
        .style("display", "block")
        .style("margin", "0 auto") // Centraliza horizontalmente
        .style("width", "100%")
        .style("height", "100vh")
        .style("background", "white")
        .style("cursor", "pointer")
        .on("click", () => zoom(root));

    canvas.appendChild(svg.node());

    const node = svg.append("g")
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .enter().append("circle")
        .attr("fill", setCircleColor)
        .attr("stroke", setStrokeColor)
        .attr("pointer-events", d => null)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke", "#000")
                .attr("stroke-width", 2);
            
            // Mostrar o label
            label.filter(l => l === d)
                .style("fill-opacity", 1)
                .style("display", "inline");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .attr("stroke", setStrokeColor)
                .attr("stroke-width", 1);
            
            // Esconder o label se não for o nó focado
            label.filter(l => l === d && l.parent !== focus)
                .style("fill-opacity", 0)
                .style("display", "none");
        })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));


    const label = svg.append("g")
        .style("fill", function () {
            return "black";
        })
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .enter().append("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => "inline")
        .style("font", d => "20px sans-serif")
        .style("font-weight", function () {
            return bold ? "bold" : "normal";
        })
        .text(d => d.data.name);

    // Create the zoom behavior and zoom immediately in to the initial focus node.
    svg.on("click", (event) => zoom(event, root));
    let focus = root;
    let view;
    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v) {
        const k = width / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(event, d) {
        const focus0 = focus;

        focus = d;

        const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

        label
            .filter(function (d) { return d.parent === focus || this.style.display === "block"; })
            .transition(transition)
            .style("fill-opacity", d => d.parent === focus ? 1 : 0)
            .on("start", function (d) { if (d.parent === focus) this.style.display = "block"; })
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "block"; });
    }

    return svg.node();
}
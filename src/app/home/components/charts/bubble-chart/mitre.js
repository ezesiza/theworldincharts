chart = {

  // Specify the charts’ dimensions. The height is variable, depending on the layout.
  const width = 928;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 10;
  const marginLeft = 40;

  // Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
  // (dx is a height, and dy a width). This because the tree must be viewed with the root at the
  // “bottom”, in the data domain. The width of a column is based on the tree’s height.
  const root = d3.hierarchy(attack_tree[0], d => d.nodes);
  const dx = 10;
  const dy = (width - marginRight - marginLeft) / (1 + root.height);

  // Define the tree layout and the shape for links.
  const tree = d3.tree().nodeSize([dx, dy]);
  const diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

  // Create the SVG container, a layer for the links and a layer for the nodes.
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", dx)
    .attr("viewBox", [-marginLeft, -marginTop, width, dx])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;");

  const gLink = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5);

  const gNode = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  function update(event, source) {
  const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
  const nodes = root.descendants().reverse();
  const links = root.links();

  // Compute the new tree layout.
  tree(root);

  let left = root;
  let right = root;
  root.eachBefore(node => {
    if (node.x < left.x) left = node;
    if (node.x > right.x) right = node;
  });

  const height = right.x - left.x + marginTop + marginBottom;

  const transition = svg.transition()
    .duration(duration)
    .attr("height", height)
    .attr("viewBox", [-marginLeft, left.x - marginTop, width, height])
    .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

  // Update the nodes…
  const node = gNode.selectAll("g")
    .data(nodes, d => d.id);

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append("g")
    .attr("transform", d => `translate(${source.y0},${source.x0})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0)
    .on("click", (event, d) => {
      d.children = d.children ? null : d._children;
      update(event, d);
    });

  nodeEnter.append("circle")
    .attr("r", 2.5)
    .attr("fill", d => d._children ? "#555" : "#999")
    .attr("stroke-width", 10);

  nodeEnter.append("text")
    .attr("dy", "0.31em")
    .attr("x", d => d._children ? -6 : 6)
    .attr("text-anchor", d => d._children ? "end" : "start")
    .text(d => nodeName(d))
    .clone(true).lower()
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .attr("stroke", "white");

  // Transition nodes to their new position.
  const nodeUpdate = node.merge(nodeEnter).transition(transition)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("fill-opacity", 1)
    .attr("stroke-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node.exit().transition(transition).remove()
    .attr("transform", d => `translate(${source.y},${source.x})`)
    .attr("fill-opacity", 0)
    .attr("stroke-opacity", 0);

  // Update the links…
  const link = gLink.selectAll("path")
    .data(links, d => d.target.id);

  // Enter any new links at the parent's previous position.
  const linkEnter = link.enter().append("path")
    .attr("d", d => {
      const o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    });

  // Transition links to their new position.
  link.merge(linkEnter).transition(transition)
    .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition(transition).remove()
    .attr("d", d => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    });

  // Stash the old positions for transition.
  root.eachBefore(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Do the first update to the initial configuration of the tree — where a number of nodes
// are open (arbitrarily selected as the root, plus nodes with 7 letters).
root.x0 = dy / 2;
root.y0 = 0;
root.descendants().forEach((d, i) => {
  d.id = i;
  d._children = d.children;
  console.log('@@@ -- --layer_type: ', d.data.type);
  if (d.data.type === "techniques" || d.data.type === "subtechnique") { d.children = null; }
});

update(null, root);

return svg.node();

function nodeName(node) {
  //console.log("@@@@@@@@@@@@@@@@@",node);
  //console.log(node.data, "&&&&&&&&&&&&&&&");
  const stix = node.data["stix"];
  const stix_type = node.data["type"];
  let name = "";
  let ext_id = "";
  if (stix_type === 'tactics') {
    name = stix.name;
    ext_id = stix["external_references"][0]["external_id"];
  } else if (stix_type === 'matrix') {
    name = stix.name;
    ext_id = "";
  } else if (stix_type === 'techniques') {
    name = stix.name;
    ext_id = stix["external_references"][0]["external_id"];
  } else if (stix_type === 'subtechnique') {
    name = stix.name;
    ext_id = stix["external_references"][0]["external_id"];
  } else if (stix_type === 'technique_detail') {
    name = "details";
    ext_id = "test";
  } else {
    name = node;
  }
  return ext_id + ": " + name;
}
  }

enterpriseAttack131 = FileAttachment("enterprise-attack-13.1.json").json()
attack_list = enterpriseAttack131["objects"];
techniques = attack_list.filter(attack_object => { return attack_object.type === "attack-pattern" && attack_object.x_mitre_is_subtechnique === false });
subtechniques = attack_list.filter(attack_object => { return attack_object.type === "attack-pattern" && attack_object.x_mitre_is_subtechnique === true });
tactics = attack_list.filter(attack_object => { return attack_object.type === "x-mitre-tactic" });
matrix = attack_list.filter(attack_object => { return attack_object.type === "x-mitre-matrix" });
attack_tree = {
  let x_matrix =[];
  x_matrix.push(get_matrix(matrix[0]));
  return x_matrix

}
function get_matrix(stix_obj) {
  let layer = {};
  layer["type"] = "matrix";
  layer["stix"] = stix_obj;
  layer["nodes"] = get_tactics();
  return layer
}
function get_tactics() {
  let all = [];
  for (let i = 0; i < tactics.length; i++) {
    let layer = {};
    layer["type"] = "tactics";
    layer["stix"] = tactics[i];
    let techniq = tactics[i]["x_mitre_shortname"]
    layer["nodes"] = get_techniques(techniq);
    all.push(layer);
  }
  return all;
}
function get_techniques(shortname) {
  let all = [];
  for (let i = 0; i < techniques.length; i++) {
    let kill_chain_phases = [];
    kill_chain_phases = techniques[i]["kill_chain_phases"];
    let check = kill_chain_phases.map(a => a.phase_name);
    if (check.includes(shortname)) {
      let layer = {};
      layer["type"] = "techniques";
      layer["stix"] = techniques[i];
      layer["nodes"] = get_sub_techniques(techniques[i]["id"]);
      all.push(layer);
    }
  }
  all.sort((a, b) => {
    let fa = a.id,
      fb = b.id;

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });

  return all;
}
function get_sub_techniques(stixid) {
  let all = [];
  let relat_map = subtechnique_of.filter(e => { return e.target_ref === stixid });
  for (let i = 0; i < relat_map.length; i++) {
    let sro = relat_map[i]
    let target_id = sro["source_ref"]
    for (let j = 0; j < subtechniques.length; j++) {
      if (subtechniques[j].id === target_id) {
        let layer = {}
        layer["type"] = "subtechnique";
        layer["stix"] = subtechniques[j];
        layer["nodes"] = [];
        all.push(layer);
      }
    }
  }
  all.sort((a, b) => {
    let fa = a.id,
      fb = b.id;

    if (fa < fb) {
      return -1;
    }
    if (fa > fb) {
      return 1;
    }
    return 0;
  });
  return all
}

enterpriseAttack131 = https://github.com/mitre-attack/attack-stix-data/blob/master/enterprise-attack/enterprise-attack-13.0.json
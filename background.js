chrome.runtime.onInstalled.addListener(() => {
  const menuItems = [
    {
      id: "insertHasRoleExactly",
      title: "Verificar se o usuário possui exatamente um papel",
    },
    {
      id: "insertHasAnyRoleExactly",
      title: "Verificar se o usuário possui qualquer um dos papéis",
    },
    {
      id: "insertIsMemberOf",
      title: "Verificar se o usuário é membro de um grupo específico",
    },
    {
      id: "insertIsMemberOfAny",
      title: "Verificar se o usuário é membro de qualquer grupo",
    },
    {
      id: "insertCancelRunningWorkflows",
      title: "Cancelar workflows em execução",
    },
    { id: "insertRestartWorkflow", title: "Reiniciar workflow de um registro" },
  ];

  menuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      title: item.title,
      contexts: ["editable"],
    });
  });
});

// Cada snippet corresponde a um item do menu de contexto
const snippets = {
  insertHasRoleExactly: `var user = 'sys_id_do_usuario';
var role = 'role_name';

var roleGr = new GlideRecord('sys_user_has_role');
roleGr.addQuery('user', user);
roleGr.addQuery('role.name', role);
roleGr.addQuery('state', 'active');
roleGr.setLimit(1);
roleGr.query();

if (roleGr.next()) {
    gs.print('Usuário possui o papel especificado.');
    return true;
}
gs.print('Usuário NÃO possui o papel especificado.');
return false;`,

  insertHasAnyRoleExactly: `var user = 'sys_id_do_usuario';
var roles = 'rol'e1',role2,role3';

var roleGr = new GlideRecord('sys_user_has_role');
roleGr.addQuery('user', user);
roleGr.addQuery('role.name', 'IN', roles);
roleGr.addQuery('state', 'active');
roleGr.setLimit(1);
roleGr.query();

if (roleGr.next()) {
    gs.print('Usuário possui pelo menos um dos papéis especificados.');
    return true;
}
gs.print('Usuário NÃO possui nenhum dos papéis especificados.');
return false;`,

  insertIsMemberOf: `var user = 'sys_id_do_usuario';
var group = 'group_name';

var grpGr = new GlideRecord('sys_user_grmember');
grpGr.addQuery('user', user);
grpGr.addQuery('group.name', group);
grpGr.setLimit(1);
grpGr.query();

if (grpGr.next()) {
    gs.print('Usuário é membro do grupo especificado.');
    return true;
}
gs.print('Usuário NÃO é membro do grupo especificado.');
return false;`,

  insertIsMemberOfAny: `var user = 'sys_id_do_usuario';
var groups = 'group1,group2,group3';

var grpGr = new GlideRecord('sys_user_grmember');
grpGr.addQuery('user', user);
grpGr.addQuery('group.name', 'IN', groups);
grpGr.setLimit(1);
grpGr.query();

if (grpGr.next()) {
    gs.print('Usuário é membro de pelo menos um dos grupos especificados.');
    return true;
}
gs.print('Usuário NÃO é membro de nenhum dos grupos especificados.');
return false;`,

  insertCancelRunningWorkflows: `var ritmNumber = 'RITM001';

var gr = new GlideRecord("sc_req_item");
gr.addQuery("number", ritmNumber);
gr.query();

if (gr.next()) {
    var flows = new Workflow().getRunningFlows(gr);
    while (flows.next()) {
        new Workflow().cancelContext(flows);
    }
    gs.print('Workflows em execução foram cancelados para o RITM especificado.');
} else {
    gs.print('Nenhum RITM encontrado com o número especificado.');
}`,

  insertRestartWorkflow: `var recordSysId = 'sys_id_do_registro';

var gr = new GlideRecord("change_request");
gr.addQuery("sys_id", recordSysId);
gr.query();

if (gr.next()) {
    new Workflow().restartWorkflow(gr);
    gs.print('Workflow reiniciado para o registro especificado.');
} else {
    gs.print('Nenhum registro encontrado com o sys_id especificado.');
}`,
};

//  Clique no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Obtém o snippet correspondente ao ID do menu clicado
  const snippet = snippets[info.menuItemId];
  if (snippet) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (snippetContent) => {
        const activeElement = document.activeElement;
        if (
          activeElement &&
          (activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "INPUT")
        ) {
          activeElement.value += snippetContent;
        }
      },
      args: [snippet],
    });
  }
});

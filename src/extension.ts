'use strict';

import * as vscode from 'vscode';
const HTML2JSX = require('htmltojsx');
const jsxformat = require('jsxformat');

const TSXTemplate = "import * as React from 'react';\n\ninterface PropsInf {\n\n}\n\ninterface StateInf {\n\n}\n\nexport class Component extends React.Component<PropsInf, StateInf> {\n\tstatic defaultProps = {\n\t\t\n\t}\n\trefs: {\n\t\t[key: string]: any\n\t}\n\tconstructor(props) {\n\t\tsuper(props);\n\t\tthis.state = {};\n\t}\n\trender() {\n\t\treturn (\n\t\t\t<-- replace -->\n\t\t)\n\t}\n}";

jsxformat.setOptions({});

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.html2jsx', () => {
        let activeEditor;
        let document;
        try {
            activeEditor = vscode.window.activeTextEditor;
            document = activeEditor.document;
            if (!activeEditor || !document) {
                return;
            }
        } catch (e) {
            return vscode.window.showInformationMessage("HTML2JSX can't get the file information! Please use in a file content.");
        }

        let createClass = vscode.workspace.getConfiguration('html2jsx').get('createClass');
        const TABCHAR = ' '.repeat(+vscode.workspace.getConfiguration('editor').get('tabSize') || 4);
        const fileExt = document.isUntitled ? '' : document.fileName.split('.').pop().toLowerCase();
        let html2jsx, convert;
        if (createClass && fileExt === 'tsx') {
            html2jsx = new HTML2JSX({createClass: false});
            convert = (code: string) => {
                code = html2jsx.convert(code);
                code = jsxformat.format(code);
                return TSXTemplate.replace(/\<\-\- replace \-\-\>/, code).replace(/\t/g, TABCHAR);
            }
        } else {
            html2jsx = new HTML2JSX({createClass});
            convert = (code: string) => {
                code = html2jsx.convert(code);
                return jsxformat.format(code);
            }
        }

        let selections = activeEditor.selections;
        activeEditor.edit(editor => {
            for (let i = selections.length - 1; i >= 0; i--) {
                let selection = selections[i];
                let text = activeEditor.document.getText(selection);
                try {
                    text = convert(text);
                } catch (e) {
                    vscode.window.showErrorMessage(e.toString());
                    continue;
                }
                editor.replace(new vscode.Range(selection.start, selection.end), text);
            }
        });
    });

    context.subscriptions.push(disposable);
}

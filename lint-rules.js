export default {
    meta: { name: "project" },
    rules: {
        "no-runtime-enum": {
            meta: {
                type: "problem",
                schema: [],
                messages: { forbidden: "Do not use enums" },
            },
            create(context) {
                return {
                    TSEnumDeclaration(node) {
                        if (!node.const) {
                            context.report({ node, messageId: "forbidden" });
                        }
                    },
                };
            },
        },
    },
};

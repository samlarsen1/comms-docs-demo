import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "rest-apis/comms-platform-api",
    },
    {
      type: "category",
      label: "Messages",
      link: {
        type: "doc",
        id: "rest-apis/messages",
      },
      items: [
        {
          type: "doc",
          id: "rest-apis/send-message",
          label: "Send a message",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "rest-apis/list-messages",
          label: "List messages",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "rest-apis/get-message",
          label: "Get message status",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Templates",
      link: {
        type: "doc",
        id: "rest-apis/templates",
      },
      items: [
        {
          type: "doc",
          id: "rest-apis/list-templates",
          label: "List templates",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "rest-apis/get-template",
          label: "Get a template",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Preferences",
      link: {
        type: "doc",
        id: "rest-apis/preferences",
      },
      items: [
        {
          type: "doc",
          id: "rest-apis/get-party-preferences",
          label: "Get communication preferences",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "rest-apis/update-party-preferences",
          label: "Update communication preferences",
          className: "api-method put",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;

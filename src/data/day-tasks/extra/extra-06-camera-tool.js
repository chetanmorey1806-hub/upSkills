// Day Task (auto-graded practice) for extra-06-camera-tool
export default {
  "lesson": "extra-06-camera-tool",
  "minutes": 12,
  "intro": "Use the Camera tool and Paste as Linked Picture to show live pictures of ranges on a dashboard.",
  "tasks": [
    {
      "type": "mcq",
      "mins": 1,
      "q": "What does the **Camera tool** create?",
      "options": [
        "A static screenshot image of the range",
        "A live picture of a range that updates when the source changes",
        "A copy of the cells with formulas",
        "A chart of the selected data"
      ],
      "answer": 1,
      "explain": "The Camera tool makes a **linked picture**: it looks like an image (you can move, resize, add borders) but it refreshes automatically when the source cells change. A screenshot never updates."
    },
    {
      "type": "fill",
      "mins": 1,
      "q": "The Camera is not on the Ribbon. In **File > Options > Quick Access Toolbar**, which list do you pick in \"Choose commands from\" to find it?",
      "accept": [
        "Commands Not in the Ribbon",
        "All Commands"
      ],
      "explain": "Choose **Commands Not in the Ribbon** (it is also in All Commands), select **Camera**, click **Add** and OK. The Camera icon then appears on the Quick Access Toolbar."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "Which Ribbon command gives the same result as the Camera tool?",
      "options": [
        "Home > Paste > Paste Values",
        "Home > Paste > Other Paste Options > Linked Picture",
        "Insert > Pictures > This Device",
        "Insert > Screenshot"
      ],
      "answer": 1,
      "explain": "Copy the range, then **Home > Paste > Linked Picture** (under Other Paste Options). It creates the same live picture. **Picture** (without \"Linked\") is static."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "You click a camera picture on the dashboard. What appears in the **formula bar**?",
      "options": [
        "Nothing",
        "The file path of the image",
        "A reference to the source range, e.g. =Sales!$A$1:$D$8",
        "The picture size"
      ],
      "answer": 2,
      "explain": "The picture is driven by a formula like **=Sales!$A$1:$D$8**. You can edit that reference (even point it to a named range) to change what the picture shows."
    },
    {
      "type": "multi",
      "mins": 2,
      "q": "Which statements about camera pictures are **TRUE**? (choose all that apply)",
      "options": [
        "They update when the source values or formatting change",
        "You can type new values directly into the picture",
        "They can be resized, moved and given a border like any picture",
        "They are useful to place tables from several sheets side by side on one dashboard",
        "They still work after the source sheet is deleted"
      ],
      "answers": [
        0,
        2,
        3
      ],
      "explain": "A camera picture mirrors the source, including formatting, so you **cannot edit values inside it**: edit the source. If the source sheet is deleted, the link breaks (#REF!)."
    },
    {
      "type": "mcq",
      "mins": 1,
      "q": "A manager wants a dashboard sheet showing a small sales table from **Sheet North** next to one from **Sheet South**, with different column widths. What is the best tool?",
      "options": [
        "Copy and Paste Values every week",
        "Camera tool / Linked Picture of each table",
        "Merge cells",
        "Freeze Panes"
      ],
      "answer": 1,
      "explain": "Linked pictures ignore the column grid of the dashboard sheet, so tables with **different column widths** can sit side by side and still stay live. Paste Values must be repeated every time the data changes."
    }
  ]
};

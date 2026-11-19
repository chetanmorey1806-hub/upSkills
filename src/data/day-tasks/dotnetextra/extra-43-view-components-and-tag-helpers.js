export default {
  lesson: 'extra-43-view-components-and-tag-helpers',
  minutes: 25,
  intro: 'Generate HTML with built-in tag helpers, write a custom tag helper and build reusable view components.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What HTML does this anchor tag helper render? (assume the default route `{controller=Home}/{action=Index}/{id?}`)',
      example: { title: 'route-based link', code: `<a asp-controller="Home" asp-action="About">About</a>
→ <a href="/Home/About">About</a>` },
      code: `<a asp-controller="Products" asp-action="Details" asp-route-id="42">View</a>`,
      expected: `<a href="/Products/Details/42">View</a>`,
      explain: 'The anchor tag helper builds the URL from route values: controller Products, action Details and `asp-route-id` fills the `{id}` segment. The `asp-*` attributes are removed from the output. If routes change, the links update automatically.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Bind a form input to the \`Email\` property of the page's model (generates name, id, type and validation attributes):
\`<input ______="Email" class="form-control" />\``,
      example: { title: 'label and validation', code: `<label asp-for="Email"></label>
<span asp-validation-for="Email" class="text-danger"></span>` },
      accept: ['asp-for'],
      caseSensitive: true,
      explain: '`asp-for` reads the model metadata: it sets `name="Email"`, `id="Email"`, `type="email"` (from `[EmailAddress]`), the current value and `data-val-*` attributes for client validation.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Make the built-in tag helpers available to all views. Complete the line in \`Views/_ViewImports.cshtml\`:
\`______ *, Microsoft.AspNetCore.Mvc.TagHelpers\``,
      example: { title: 'registering your own tag helpers', code: '@addTagHelper *, MyShopApp' },
      accept: ['@addTagHelper'],
      caseSensitive: true,
      explain: '`@addTagHelper *, AssemblyName` registers all tag helpers from that assembly. Without it, `asp-*` attributes are rendered as plain text attributes and do nothing.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'You create a view component for the shopping cart summary. Which statements are TRUE? Select all that apply.',
      options: ['The class can be named `CartSummaryViewComponent` and derive from `ViewComponent`', 'Its logic goes in `Invoke()` or `InvokeAsync()`', 'Its default view is `Views/Shared/Components/CartSummary/Default.cshtml`', 'It is reached directly by an HTTP URL like a controller action', 'It can be rendered with `<vc:cart-summary></vc:cart-summary>` or `@await Component.InvokeAsync("CartSummary")`'],
      answers: [0, 1, 2, 4],
      explain: 'View components are like mini-controllers with their own view, used for reusable widgets (cart, menu, login panel). They are rendered from a view or layout, **not** routed to directly by a URL.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A custom tag helper. What HTML does `<price amount="1499"></price>` render?',
      example: { title: 'tag helper naming', text: 'A class named `PriceTagHelper` targets the `<price>` element. Public properties map to attributes (`Amount` ↔ `amount`).' },
      code: `public class PriceTagHelper : TagHelper
{
    public int Amount { get; set; }

    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "span";
        output.Attributes.SetAttribute("class", "price");
        output.Content.SetContent("Rs. " + Amount);
    }
}`,
      expected: `<span class="price">Rs. 1499</span>`,
      explain: 'The `TagHelper` suffix is dropped to find the target element `<price>`. `TagName = "span"` changes the element, `SetAttribute` adds the class and `SetContent` writes the inner text. The `amount` attribute was bound to the property, so it is not copied to the output.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main difference between a **partial view** and a **view component**?',
      options: ['There is no difference', 'A partial view only renders markup with the data passed to it; a view component has its own C# logic (and DI) to fetch data', 'Partial views cannot use Razor', 'View components cannot have views'],
      answer: 1,
      explain: 'Use a partial view for reusable markup when the parent already has the data. Use a view component when the widget must load its own data (e.g. cart count from a service) independent of the page\'s controller.',
    },
  ],
};

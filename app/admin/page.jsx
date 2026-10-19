import AdminEditor from "../../components/admin-editor";

export const metadata = { title: "Site admin" };

export default function AdminPage() {
  return (
    <div className="admin-page page-wrap">
      <section className="page-hero">
        <p className="eyebrow">Waves Spa</p>
        <h1>Site admin.</h1>
        <p>Update contact details, locations, and treatment listings.</p>
      </section>
      <AdminEditor />
    </div>
  );
}

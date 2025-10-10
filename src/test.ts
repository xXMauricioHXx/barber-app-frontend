import {
  doc,
  getDocs,
  collection,
  query,
  addDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ClientData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  nome?: string;
  [key: string]: unknown;
}

setImmediate(async () => {
  const sourceBarberId = "Zh5kb2UCEXfqYd4IRQhUjCgMXxt2";
  const targetBarberId = "Rrmw5PDmkqaR0qF6CAfBe16lMsW2";

  try {
    console.log("🔍 Buscando clientes do barbeiro origem...");

    // Buscar todos os clientes do barbeiro origem
    const q = query(collection(db, "barbers", sourceBarberId, "clients"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ Nenhum cliente encontrado no barbeiro origem.");
      return;
    }

    const clients: ClientData[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));

    console.log(`📊 Encontrados ${clients.length} clientes para transferir.`);

    // Transferir cada cliente para o barbeiro destino
    const transferResults = [];

    for (const client of clients) {
      try {
        const clientName = client.name || client.nome || client.id;
        console.log(`⚡ Transferindo cliente: ${clientName}`);

        // Remover o ID do documento original para criar um novo
        const { id, ...clientData } = client;

        // Converter datas de volta para Timestamp do Firestore
        const clientForFirestore = {
          ...clientData,
          createdAt: Timestamp.fromDate(clientData.createdAt),
          updatedAt: Timestamp.fromDate(new Date()), // Atualizar timestamp da transferência
        };

        // Adicionar cliente ao barbeiro destino
        const targetClientRef = await addDoc(
          collection(db, "barbers", targetBarberId, "clients"),
          clientForFirestore
        );

        // Deletar cliente do barbeiro origem
        await deleteDoc(doc(db, "barbers", sourceBarberId, "clients", id));

        transferResults.push({
          originalId: id,
          newId: targetClientRef.id,
          name: clientName,
          status: "success",
        });

        console.log(`✅ Cliente transferido com sucesso: ${clientName}`);
      } catch (error) {
        const clientName = client.name || client.nome || client.id;
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Erro ao transferir cliente ${clientName}:`, error);
        transferResults.push({
          originalId: client.id,
          name: clientName,
          status: "error",
          error: errorMessage,
        });
      }
    }

    // Resumo da transferência
    console.log("\n📋 RESUMO DA TRANSFERÊNCIA:");
    console.log(`Total de clientes: ${clients.length}`);
    console.log(
      `Transferidos com sucesso: ${
        transferResults.filter((r) => r.status === "success").length
      }`
    );
    console.log(
      `Erros: ${transferResults.filter((r) => r.status === "error").length}`
    );

    if (transferResults.some((r) => r.status === "error")) {
      console.log("\n❌ Clientes com erro:");
      transferResults
        .filter((r) => r.status === "error")
        .forEach((r) => console.log(`- ${r.name}: ${r.error}`));
    }

    console.log("\n🎉 Transferência concluída!");
  } catch (error) {
    console.error("💥 Erro geral durante a transferência:", error);
  }
});

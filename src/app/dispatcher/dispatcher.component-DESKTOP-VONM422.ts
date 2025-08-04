import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-dispatcher',
  standalone: true,
  templateUrl: './dispatcher.component.html',
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./dispatcher.component.css']
})
export class DispatcherComponent {
  cpfRg: string = '';
  retriever: any = null;
  business: any = null;
  dispatcher: any = null; // Adicionado para armazenar dados do despachante
  invoiceNumbers: string = '';
  warehouseCode: string = '';

  constructor(private http: HttpClient) {}

  searchRetriever() {
    if (!this.cpfRg.trim()) {
      alert('Por favor, digite um CPF ou RG válido.');
      return;
    }

    this.http.get(`http://localhost:3000/retrievers?cpf=${this.cpfRg.replace(/\D/g, '')}`).subscribe({
      next: (data: any) => {
        if (data.length) {
          this.retriever = data[0];
          this.fetchBusiness(this.retriever.business_id);
          this.fetchDispatcher(this.retriever.dispatcher_id); // Busca o despachante
        } else {
          alert('Retirante não encontrado.');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar retirante:', err);
        alert('Erro ao buscar retirante. Tente novamente.');
      }
    });
  }

  fetchBusiness(businessId: number) {
    this.http.get(`http://localhost:3000/businesses/${businessId}`).subscribe({
      next: (data: any) => {
        this.business = data;
      },
      error: (err) => {
        console.error('Erro ao buscar empresa:', err);
      }
    });
  }

  fetchDispatcher(dispatcherId: number) {
    this.http.get(`http://localhost:3000/dispatchers/${dispatcherId}`).subscribe({
      next: (data: any) => {
        this.dispatcher = data;
      },
      error: (err) => {
        console.error('Erro ao buscar despachante:', err);
      }
    });
  }

  saveDispatch() {
    if (!this.retriever || !this.invoiceNumbers || !this.warehouseCode) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    const dispatchData = {
      retriever_id: this.retriever.id,
      invoice_numbers: this.invoiceNumbers,
      warehouse_code: this.warehouseCode,
      date: new Date().toISOString()
    };

    this.http.post('http://localhost:3000/dispatches', dispatchData).subscribe({
      next: () => {
        alert('Despacho registrado com sucesso!');
        this.clearForm();
      },
      error: (err) => {
        console.error('Erro ao salvar despacho:', err);
        alert('Erro ao registrar despacho.');
      }
    });
  }

  clearForm() {
    this.cpfRg = '';
    this.retriever = null;
    this.business = null;
    this.dispatcher = null;
    this.invoiceNumbers = '';
    this.warehouseCode = '';
  }
}

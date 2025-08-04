
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-dispatcher',
  standalone: true,
  templateUrl: './dispatcher.component.html',
  styleUrls: ['./dispatcher.component.css'],
  imports: [FormsModule, NgIf, NgClass, NgxMaskDirective, NgxMaskPipe],
  providers: [provideNgxMask()]
})
export class DispatcherComponent {
  searchType: 'cpf' | 'rg' = 'rg';
  identifier: string = '';
  get maskFormat(): string {
    return this.searchType === 'cpf' ? '000.000.000-00' : '000000000';
  }
  get placeholderText(): string {
    return this.searchType === 'cpf' ? '000.000.000-00' : '';
  }

  retriever: any = null;
  business: any = null;
  dispatcher: any = null;
  invoiceNumbers: string = '';
  warehouseCode: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private http: HttpClient) {}

  toggleSearchType(): void {
    this.searchType = this.searchType === 'cpf' ? 'rg' : 'cpf';
    this.identifier = '';
    this.retriever = null;
    this.business = null;
    this.errorMessage = null;
  }

  searchRetriever() {
    if (!this.identifier.trim()) {
      this.errorMessage = 'Por favor, digite um CPF ou RG válido.';
      return;
    }

    const cleanId = this.identifier.replace(/\D/g, '');
    const queryParam = this.searchType === 'cpf' ? 'cpf' : 'rg';

    this.http.get(`http://localhost:3000/retrievers?${queryParam}=${cleanId}`).subscribe({
      next: (data: any) => {
        if (data.length) {
          this.retriever = data[0];
          this.fetchBusiness(this.retriever.business_id);
        } else {
          this.errorMessage = 'Retirante não encontrado.';
        }
      },
      error: (err) => {
        console.error('Erro ao buscar retirante:', err);
        this.errorMessage = 'Erro ao buscar retirante. Tente novamente.';
      }
    });
  }

  fetchBusiness(businessId: number) {
    this.http.get(`http://localhost:3000/business/${businessId}`).subscribe({
      next: (data: any) => this.business = data,
      error: (err) => console.error('Erro ao buscar empresa:', err)
    });
  }

  saveDispatch() {
    if (!this.retriever || !this.invoiceNumbers || !this.warehouseCode) {
      this.errorMessage = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const dispatchData = {
      retrieverId: this.retriever.id,
      invoiceNumbers: this.invoiceNumbers.split(',').map(n => n.trim()),
      almoxarifeCode: this.warehouseCode,
      dispatchedAt: new Date().toISOString()
    };

    this.http.post('http://localhost:3000/dispatchers', dispatchData).subscribe({
      next: () => {
        this.successMessage = 'Despacho registrado com sucesso!';
        this.clearForm();
      },
      error: (err) => {
        console.error('Erro ao salvar despacho:', err);
        this.errorMessage = 'Erro ao registrar despacho.';
      }
    });
  }

  clearForm() {
    this.identifier = '';
    this.retriever = null;
    this.business = null;
    this.dispatcher = null;
    this.invoiceNumbers = '';
    this.warehouseCode = '';
  }

  showSearchField: boolean = false;
  searchCategory: 'autoparts' | 'almoxarife' | null = null;
  queryText: string = '';
  result: {
    nomeRetirante: string;
    codigoAlmoxarife: string;
    dataHora: string;
    nomeAutopecas: string;
  } | null = null;

  startSearch(): void {
    this.showSearchField = true;
    this.searchCategory = null;
    this.queryText = '';
    this.result = null;
  }

  selectCategory(type: 'autoparts' | 'almoxarife'): void {
    this.searchCategory = type;
    this.result = null;
  }

  searchByCategory(): void {
    if (!this.queryText.trim()) {
      this.errorMessage = 'Por favor, preencha o campo antes de consultar.';
      return;
    }

    const query = this.searchCategory === 'almoxarife'
      ? `almoxarifeCode=${this.queryText.trim()}`
      : `invoiceNumbers_like=${this.queryText.trim()}`;

    this.http.get<any[]>(`http://localhost:3000/dispatchers?${query}`).subscribe({
      next: (dispatches) => {
        if (!dispatches.length) {
          this.result = null;
          this.errorMessage = 'Nenhum registro encontrado.';
          return;
        }

        const dispatch = dispatches[0];

        this.http.get<any>(`http://localhost:3000/retrievers/${dispatch.retrieverId}`).subscribe({
          next: (retriever) => {
            this.http.get<any>(`http://localhost:3000/business/${retriever.business_id}`).subscribe({
              next: (business) => {
                this.result = {
                  nomeRetirante: retriever.name,
                  codigoAlmoxarife: dispatch.almoxarifeCode,
                  dataHora: new Date(dispatch.dispatchedAt).toLocaleString(),
                  nomeAutopecas: business.name_fantasy
                };
              },
              error: () => this.errorMessage = 'Erro ao buscar empresa.'
            });
          },
          error: () => this.errorMessage = 'Erro ao buscar retirante.'
        });
      },
      error: () => this.errorMessage = 'Erro ao consultar despacho.'
    });
  }
}

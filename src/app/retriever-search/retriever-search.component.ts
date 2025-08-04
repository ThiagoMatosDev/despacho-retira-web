import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NgIf } from "@angular/common";

@Component({
  selector: 'app-retriever-search',
  standalone: true,
  templateUrl: './retriever-search.component.html',
  imports: [
    FormsModule,
    NgxMaskDirective,
    NgIf
  ],
  providers: [provideNgxMask()],
  styleUrls: ['./retriever-search.component.css']
})
export class RetrieverSearchComponent {
  cpfRg: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  @Output() retrieverFound = new EventEmitter<any>();

  constructor(private http: HttpClient) {}

  searchRetriever() {
    const cleanedValue = this.cpfRg.replace(/\D/g, '');

    if (!cleanedValue) {
      this.errorMessage = 'Digite CPF ou RG para pesquisar!';
      return;
    }

    if (!(cleanedValue.length === 11 || cleanedValue.length >= 8)) {
      this.errorMessage = 'Documento inválido! CPF precisa ter 11 dígitos ou RG no mínimo 8.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.http.get(`http://localhost:3000/retrievers?cpf=${cleanedValue}`).subscribe({
      next: (data: any) => {
        if (data.length) {
          this.retrieverFound.emit(data[0]);
        } else {
          this.errorMessage = 'Retirante não encontrado. Verifique o documento.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Erro na conexão com o servidor. Tente novamente.';
        console.error('Erro na busca:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  voltarParaPrincipal() {

  }
}

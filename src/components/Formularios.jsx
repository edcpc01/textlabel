// src/components/Formularios.jsx
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// Logo Doptex em base64 — extraído do formulario2_classificacao.html
const LOGO_DOPTEX_B64 = `data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAENAxoDASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAYIBQcDBAkCAf/EAFMQAAEDAwEDBQgNCgUDAgcAAAEAAgMEBQYRBxIhCBMxQVEUIjdhcYGRsRUWIzJCUlZzdJKhstEzNlNUVXKTlMHhGCQ0Q2IXNYKisyZEY2SDhNL/xAAbAQEAAwEBAQEAAAAAAAAAAAAABAUGAwIBB//EADYRAAICAQIDBQYGAgIDAQAAAAABAgMEBRESITETQVFScQYVMjOBoRQWImGRsSM0wdEkQvBD/9oADAMBAAIRAxEAPwC5aIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAImo101CIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiID8e5rGl73BrQNSSdAFW3bTygZKKtqLHiAaXxExy1bup3Xu+RS7lRbQRiuKmzUMoFxuLS0EcSxnXr2a68FTB7y95e9xc5x1JPWVo9G0yNq7a1cu5FXnZbg+zg/UnEm1vaI+fnvbTXB3Vo4cPsWw9l3KHvdtrYaLK3Gvonu0fP/uN16/IFoLeCbwV/bg41seFxRWwyLYPdM9LbVX0l0t0FfRTMmp52B7HtOoII1XZVf8AkX5DU3DFblZqmXeZQzNMIPTo/UlWAWFy8f8AD3Sr8DQ02drBSCIijnUIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIuOeogp2b880cTe17g0fagORdW7V0FtttRX1LwyGCMvcT2AKI5JtXwWwvdFW32n50fAYd7XzhaN28bc7bkmKT49jkczTUECWdx0G6Drw9CnY2n33SSUXt4ke3JrrT58zTe2DNKjNM4rbrJIXQB5jpx0aRg97w7dFDecX2KY9bivoU7Oskrb11OEVGK2SKCU1J7s4uc8a/N9dgQxj4K/eaj+KF04JHjiRaXkQ218FivN2qAGMqJmNgcXab27vB32qyIljPRIw+decNtyK922mbTUNxnp4WnUMY7QLKU+0LMqfTmr9Vt0/wCWqocvRLMi12ca5ljTnxrgo8J6GAg9BRUQt22vaNRaAZBNKwfBeBp6lKrNylMypHAVlLSVbOsv11UCegZMejTJMdSqfXdFxUVeLDynrNLusu1nqYnnpfG4boWzMV2s4PkW6yjvMMczumOQ7pHnKr7tPyaecoMkwyap9JE7RccFRBUM34Jo5W9rHBw+xcihncIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiKL5zneOYfROqLvXxseBq2Fp1e7yBe4QlZLhit2fJSUVuyUKJ5ttDxTEaV012ukIeP9qJwe/X90cVWPabygciv8klHYT7G0J1G838o4duvSFpqurKuuqHVFZUy1Erul8jy4nzlaDE0Ccv1XPb9u8rLtSiuVa3LCZxymbhO98OK0DKePiBLUDeLvGBw0Wn8m2iZhkTn+yd7qXxu/2mvIYPMomi0FGBj0L9EStsybbPiZ9Oc5x1c4k+Mr5RFLOARF8PmjZ0uCNpH3bc+0Uo2VYZcNoOQutNsO5uM35JHdDQrCY9yYLTCGvvF4mqT1xsbugecFQcjUsfHe05cyRVi22reKKprkhhmmOkMUkh7GNJ9SvHZthWzu2brmWuSZ46TLKXg+YqYW/DcWoGBlLYLazTr7mZr6dFW2e0NK+CLZKjpk31Z58RWS9S/krRcJP3aZ5/ouf2sZLpr7Xrvp9Ck/BeikNtt8H5Gip4/3YwF2Nxmmm6NPIo79o5d1f3Oi0td8jzemsF9hbvS2S5RjtdSvH9F0Xsnp5N17ZInjqILSvSqeio527s1LDIOxzAVHch2fYffKd0VdYqPvgRvxxNY70gar3D2ii3+uH3PktLf/AKyKSYftKzDFpWOtl2m5pv8AsyEuYfMrBbNOUda7lJFQZTAaOodo0VDBqxx8nV6Vr3lAbF4cLovZ2xSSSW4v3XxPOpj16OPWtHKweNiajX2iX16Mi9rfiy4Wz0tt9bSXClZU0VTFUQvGofG8OHpC7CoTsp2o3/BrpG6KokqLeTpLTPcS3d8XYVdXAcutOZ2CG7WqYOY8d+w++YewhZjP02zDe/WPiW+NlxvW3RkhREVaSgiIgCIq/wDKk2oXPGZYMcsc3MVE8fOTTDpa3iNB2FSMXGnk2KuHU5XWxqhxSN/GSMHQvaPOvznYv0jPrBedUmYZW95e7I7rqTqf80/8V8+27KflFdf5t/4q8/Ls/Ov4K/3pHynovzsX6Rn1gv0SRnoe0+dec/tuyn5RXX+bf+K/Rl+VA6jI7sP/ANt/4p+XZ+dfwPekfKejKKgth2t57Zt3ua+zS7v6wTJ6ytrYLymayNzKfK6FsrfhVEI0P1Qot2hZNa3jtI7V6jVLk+RaRFHsLzPH8uoG1dlro5hpq6MnR7fKFIVTzhKD4ZLZk6MlJboIiLyfQiIgCLEZRklmxq3PrrxWxU0TR8J3F3iAVfs85TLGl9PidBvdQqJxpp/4qXjYN+S/8cfr3HG3Irq+JlmF8GWIHQyMB8bgqHX7bHn953hUXp8QP6uOb9SjLsuylzt52RXUn6W/8VbQ9nbWv1TSIUtTh3RPRlrg4atII8RX6vPS07Q8ztkvOU+Q17j2SzuePQSti4hyjsvt07WXpkFxpxw0DAxwHlHSudugXxW8GmeoalW/iWxcZFrnZvtgxPMyynp6nuWtPTDN3pJ8XatjAgjUHUKmtpnTLhmtmToTjNbxe4REXM9hfPOx/pGelVf5TW1m80eRTYrYap1IynGlRJGdHl3ToD1cCFog5dlROpyO6/zb/wAVeY2h23Vqxy23K+3UIVycUtz0W52L9Iz6wTnYv0jPrBedHtuyn5RXX+bf+Ke27KflFdf5t/4qR+XZ+dfwcvekfKei/OxfpGfWCc7H+kZ9ZedHtuyn5RXX+bf+Ke27KflFdf5t/wCKfl2fnX8D3pHyno0CCNQQUXnzZNpWbWiUSU2QVshB10mldIPQSt3bL+Ue+apit+YQMaHaDuuMacfGOpRcjQ8ipcUf1HarUK5vZ8izCLr22upbjRRVlFOyeCVu8x7DqCFzvcGsc49AGqpmmnsyefpIA1K+Odi/SM+sFTjbvtfyC7ZPV2qzV8tFbqZ5jaYXlrnkdeoWr/bdlPyiuv8ANv8AxV9RoFtkFKUktyts1KEZNJbnovzsX6Rn1gnOxfpGfWC86PbdlPyiuv8ANv8AxT23ZT8orr/Nv/Fdfy7Pzr+Dx70j5T0X52L9Iz6wTnYv0jPrBedHtuyn5RXX+bf+Ke27KflFdf5t/wCKfl2fnX8D3pHynovzsX6Rn1gvprmu964HyFec3tuyn5RXX+bf+KyFg2h5jZ7jHW09+r5XMOpZNO57T5QSvj9nbNuU1/B9Wpx74noUih+yDLxmuE0l5LQ2YjcmA6A8Diq7cova5fZ8oqcesdbJRUVKdx74nFr3u6+I4jTiqvG0+2+50rk11JluTCutT8S2/Ox/pGfWX5zsX6Rn1gvOj23ZT8o7r/Nv/FPbdlPyiuv82/8AFWv5dn51/BC96R8p6L87F+kZ9YJzsX6Rn1gvOj23ZT8orr/Nv/FPbdlPyiuv82/8U/Ls/Ov4HvSPlPRfnYv0jPrBfvOx/pGfWXnP7bsp+UV1/m3/AIp7bsp+Ud1/m3/in5dn51/A96R8p6NIqkcnPa3fYsppMcvdbJW0lY/cY+Vxc5juriVYTbDmTcKwmpu7Gh9QW7sDT0FyqsnT7aLlS+bfQmVZMLK3PwJmi8+7ptNza4XU3CS/1sby7eDIpXNYP/EHRWL5OG2CXJ//AIfyOeMXFjfcZdNOdHZ5ehScrRbsevtN9/E5U59dk+HbY3yiIqcnBERAEWAz7KbfiGN1N4uErWtjadxuvF7uoBUqzXa5mWR3eSrF2qaGHe9yip5CwNb1A6HirHB0y3M3ceSXeRcjLhRyfNl9EVZOTLtavFyvjcYyGpNU2Uf5eV3Fwd2E9as2uGXiTxbOzmdKbo3R4ohERRTsEREAREQBERAEREAXxPLFBE6WaRsbGjUucdAFw3SvpLZQy1tdOyCCJpc97joAAqgbddtdxyasns9gnkpbS0ljnNOjpvL4lNwsCzLntHp3sj5GRGiO76mw9te32ntRls2JPbUVXFslUD3rPJ41V++Xm53uufW3SsmqpnnUue4n0DqXQJJJJOpPWvxbXEwasWO0Fz8ShvyJ3PeQRF+jidAphwPxfoBJ0A1KnOzzZZleaVDRQUT4KXXv6iZu60DtAPT5lZjZ5sAxPH4Y5rxC27Vo0LjIPcwfEFXZeqUY3Jvd+CJVOJZbzS2RS2p3qcgTMcwkagOGhXUkqz0Mb6VONv1wpLntQujrfG2OiheIoYwODd1oB+0FQMR+JdoXTsgpbbbnh1xi2upxvklf0uOi+BGSeOpXZEazWE2KbIMrttmgHulXO2MecrzJbJykz6nz2Rbfkf4dHY8AF6nhb3Vcnb7X6d8GdGnpC3iulYbfDa7NSW+njbHHBE1ga3oB04rurCZFrutc33mhqhwQUQiIuJ0CIiAIiICH7ZqWGq2b3lk4aWtpnvG8OsNJC8+leXlN3tlm2XVvfaSVDhE1uvEg8D61Rpa/2ei1RJvvZSam07Egtq8mzOJsVziCjnmd7H17hFIwngHHoPpK1UuaiqH0tXFUxHR8Tw9p8YKusimN1brl3kCubrkpLuPS5jmvaHNILSNQV+rA7PK11xwiz1j+L5KSMu8u6Fnl+cTjwycfA1MXutwiIvJ9CphyvPCc36MPWVc9Uw5XnhOb9GHrKutB/wBr6Mgaj8n6mmVyx09RI3ejgle3tawkLiVyOSxZLTW7KaWeroIJpDK/Vz26n3xWnz8xYlXaNb8ypx6O3nw77FPu46v9Vn/hlDSVY6aWcf8A4yvRf2s2D9k0v1F8yYrjsjS19opHA9ILFT/mKPk+5N91vzHnI5padHAg9hC/FfDJ9i+AXyB7XWSGjlf/AL1ON1/pVdNrewm94myS5Wkm421vE7o1fGPGOvzKwxdYx8h8PR/uR7sG2tb9UayxXJbzjNyjr7PWy08rDro13B3iIVxthW1yhzmhbQV7mU94ib37CeEg7QqROBaSCCCOkFd6wXatsl2p7nb5nRTwPD2uB7Cuufp9eXDwl3M8Y2TKmX7HpMihmx/NqTOMRp7lE4CpY0MqGE8Q4dfn6VM1hLK5VzcJdUaGMlNKSCge2DaRa8Csj5pXtlr5GkQQA8Se0+JSPNMhocXxyrvFfIGRwRktBPvnacAPKVQTaBlNfl2TVV3rpXO5x55tpPvG9Q9CtNK078VPin8K+5EzMrsY7R6s5M7zW/ZjdH1t3rZJAT3kW93rR2aKNItl7JNkF/zuVlVu9x2sHvqiQe+HiH9VsJzqxa93yiijjGdsuXNmtWguOjQSewLnbQ1rhq2jqCO0RlXgw7YhgmPwM37Wy4VA6Zakbx18SndPYbNTxCKG20zGAaABgVLb7Q1p7Qi39ifDTJtfqex5wSwzRHSWKRn7zSFxr0Lv2zzDb2xzbjYKOZzh74s4haL2p8nHmKeW44bM5+7q51LKeJ/dPABd8bXaLXwz/S/sc7dPsgt48yttLUT0s7Z6aZ8UrTq1zHEEKyvJ/wBuU0lRDjuW1G9vaMp6px6PE5VtuNFVW+tlo62B8M8Ti17HjQgrhY5zHBzSQ4HUEdSsMrEqy6+GX0ZGpunTLdHpjG9kkbZI3BzXDUEHUFfS0JyVtpJvdp9rF2qNa6lb7g5x9+zs8y32sHlY0sa11y7jRU2q2CkihHKE8MOQfPt+41QFT7lCeGHIPn2/caoCt/ifIh6L+jOXfMl6s5mUtS9ocynmcD1hhK/e46v9Vn/hlXk2K2CzVOza0TT22nkkdCCXOZxPBTP2s2D9k0v1FSWe0EYTceDp+5PhprlFPiPOjuOr/VZ/4ZTuOr/VZ/4ZXov7WbB+yaX6ie1iwfsml+ovH5ij5Puffdb8x5xyMfG7dexzD2OGi+VeXabsbxXJ7TUPpLfBRXIMJinjbpx6tfEqU5Ba6my3mqtdY3dnp5Cx4Vtg6jXmJ8PJruIeRjSofPobu5LW02e03lmK3iqc631J0p3Pd+Tf1Dz8ArbSNEkTm68HNIXmnQVMtHWwVcLt2WGRsjD2EHUL0N2cXgX3CrXctdXSU7A89rgBr9qodexFXNXR7+vqWOnXOUXB9xTbbls+vGMZjWSijmloaiUyQysYSDqdVrvuOr/VZ/4ZXpRV0tPVxGKphZKw9IcNVjvazYP2VS/UXuj2gcIKM4btHyzTVKTcWedHcdX+qz/wyuJ7XMcWvaWuHSCNCvRw4zYNP+00v1FRzb3Tw0u1a8wU8bY42yN3WtGgHehWmn6qsybgo7bIh5OG6IqW+5BFzMpal7Q5lPM4HoIYSFwq9Ow+wWap2Y2Wae208kjqdpc5zOJ4Bd9QzlhwUmt9znjY/bya32KO9x1f6rP/AAyuzbbLdbjWR0lJQVEksjt1oEZXod7WbB+yaX6i7FDZrXRPL6SgghcetrAqh+0S25Q+5NWl+MiIbBsSqMO2e0lsqxpUSHnpW/Fc4DUKmG1bwh3v6XJ94r0NXnltW8Id7+lyfeK86FZK3IsnLqz7qEFCuMV3EXXO2kqnAFtNMQegiMr4pxrURg/HHrV+9neO2OXB7PJJbKZz3UzSSWcSrjUNQWFGLcd9yFjY3btrfbYoP3HV/qs/8Mp3HV/qs/8ADK9F/azYP2TS/UT2s2D9k0v1FVfmKPk+5L91vzHnR3HV/qs/8Mp3HV/qs/8ADK9F/azYP2TS/UT2s2D9lUv1E/MUfJ9x7rfmKgcm/ALxec5obvLSTQUFFJzjpHtIDiOpWQ5QWJVGV7PKijohrU04MsTe3Tp+wLYVPBDTxiOCJkbB0Bo0XIQCNDxCqMnUrL8iNyW3D0J1WJGutw8TzPqoJaaokp543RyxuLXNcNCCuaz3GrtVyguFFM6KeB4exzTpoQrDcqnZb3LK/MrHT+5yO/zkTB0E/C086rctli5MMupTj39SiuqlTPhZfPYftCpc6xaKZz2suEADJ4teOo61sJee2y7M6/CMpgutI93Nahs8evB7OxXzxG/0GTWClvFtlEkE7A4aHiD2HxrI6rp7xbOKPwv/AO2LrDye2js+qMsuGuqoKKklqqmRscUTS5znHQALmPAalVj5VO1Iuc/DbHUnQf62Rh4H/jr6FDw8SeVaoR+p3vujTDiZrnlB7SZ83yR9NRzOFopHFsLAeDz8YrVi/VJ9meHV+a5RT2ijY7cc4GaTTgxvWdVvIQrxadlyijOylK6e/ezZPJOwuuumYMyKSNzKKhIc15Hvn9QCuIsNheO0GLY9S2e3xNZFAwAkD3x6ysysPqGY8u5z7u40GNR2NfD3hERQSQEREAREQBERAFx1U8VLTSVE7wyKNpc5xPAALkVeOVrtEkttGzErVUFlRON6qcw8Qzs9IUnExpZNqrj3nK61VQcma25Qu1qry26zWW1TmOzwPLdWn8sR1nxLTSIt/j48MetQguSM3ZZKyXFIIi7Fuoqm4V0VFRxOlnmcGsY0akkrs3tzZzP220NXcayOjoqeSeeQ6MYxupJVnNivJ+ipuZvWYsEkvB0VIDqB+92+RS3YDshpMPoI7tdomTXeVoPfDUQjsHjW41k9T1mU266HsvEucTBSXHZ18Dho6Wno6dlPSwshhYNGsYNAAurklxbaLBXXNw1FLA6U+YLILX/KDuwtGyq7yH/5iI04/wDIFUVMHZbGPiyxslwQb8CiN8m7tvVbV/pp3v8AS4ldQMXIi/R1BJbGWcmz4DFuzkg2Bly2kG4zwl8NFA5zXfFk1bu/1WllbjkXWh9JhtzuckfCsqGmJxHU0OB+1V2rWdliSa7+X8krChx3I36iIsIaIIiIAiIgCIo1tLyelxLD6671Ega6OMiIa8S48Bp5yvUIOclGPVnyUlFbsrZywsv9ksmp8ap5NYaEb8m6eBc7qPk0Wgl3r9dKq9Xiqula8vnqZDI8k9ZK6K/Q8THWPTGtdxmLrHbNyC/QCToBqSvxZfDLc+7ZVbbexpdz9QxpA7CeKkSkoptnNLd7F9tk8L4NnVjjk993HGfS0KULqWWjbbrRSULeinibGPMNF21+a2S4puXizVQW0UgiIvB6CphyvPCc36MPWVc9Uw5XnhOb9GHrKutB/wBr6Mgaj8n6mmVdjkl+CKk+ek+8VSdXY5JfgipPnpPvFXOv/wCqvVEHTfnfQ26iIsYXoXzLGyWN0cjQ5jhoQeghfSIConKf2WR47V+2ayU5bQTu93jaOEbu3xDitCr0bziyU+Q4tcLVUxh7ZoXBoI6HaHQ+nReeN9oH2u9VltkOr6aZ0TvKDotpombK+pwn1j/RQ59CrnxR6M2pyVsudYM+ZbZ5S2kuA5vdJ4B/DQ+jVXUB1Go6F5q2aqlorrS1ULix8crXAjq4r0Yx+4xV2O0txYdY3wB+vmVZ7QUKNkbF3kvTbN4uD7it3LLy4TVlFiVLLwiHPVAB4HXTdHmIKrapftkujrttLvdUXlzRVPZGdfghx0USY0ve1o6SdFodPoVGPGK8CsybHZa5GzOT/s4kzrJw+qY4WukO/O7o3v8AiD6Fd610FHa6CKhoIGQU8Ld1jGDQAKCcnvF48Z2cUERYBU1LedmOnST0fZotiLI6rmyybmt/0roXeHQqq0+9hERVZLCIiA0ZymNldNf7LNktnpt26Uzd6RrB+Vb5Os9Cp+9rmPLHDRzToQvTGRjZI3RvALXDQgqhe3zGBi+0i4UsTd2mneZYBp0NP99VqtBzZTTom+nQp9RoUdrF9SPYBfpsay633iJ5YIJml+nWzXiPQvQqx3CG62iluMDgY6iJsg0PaNV5rq8fJfu5umyigEj96WBzo3ceganT7F99oaE4RtXVcj5plm0nAq1yhPDDkHz7fuNUBU+5QnhhyD59v3GqAq8xPkQ9F/RAu+ZL1Zf7Yb4MLN8wPUpuoLsOmhbsxs4dKwHmBwLh2Kbc/B+mj+sF+f5K/wA0vVmkq+BehyIuPn4P00f1gnPwfpo/rBcdjocio7yoaaCn2s3B0LQDL379O1W+zbNLDitonrrjXwtLGEsjDwXPPYFQ7aDkU2VZdX3ubUd0ylzWk9A6lofZ+ifauzblsVepWR4FHvI+ry8luWSbY5bHSEkiSUcewOVHGNc97WNBLnHQAdav/sSs7rJs0tNE9m44xCUj94Aqd7QySojHv3OGmJ9o3+xNERFjy7B6FQrlDeFy9/ON+6FfU9CoVyhvC5e/nG/dCv8A2e+fL0/5K3U/lr1Nfq/mwbwVWP6M31BUDV/Ng3gqsf0ZvqCn+0PyY+pG0z5j9CcoiLIl2F55bVvCHe/pcn3ivQ1eeW1bwh3v6XJ94rRezvzZ+hV6n8ESN03+oj/fHrXohs1/MKzfRWrzugIbPG4nQBwJ9KvBgW1DAKLDbVS1WU26KeKna17HPOrT2dCma/XOcIcKb5nDTZRjKW7NpIoT/wBWdnPyutn1z+Cf9WdnPyutn1z+CzH4W7yP+GW/bV+ZE2RRezbQsKvNUKW2ZJQVMx6GMfxKlAII1B1C5zrlB7SWx6jJS6MIiLwejguFJBX0U1HVRiSGZhY9pHSCNCqO7fNnFRg2TSSU8bnWuqcXwPA4N147pV6VG9ouJW7MsaqLTXxtJc0mJ+nFjuohWOm5zxLd38L6kXKx1dD9zzuW5OTXtOkxG/Ns1ymJtNY4N4nhE89fn4LXGc4zcMTyKps9xiLJInHddpwc3qIWDBIIIJBHQQtrdVXlU8L5plDCcqZ7rqi7fKA2n0uI4rzNsqI5bjXMIh3Ha7rSPffaqU1lTNWVUtVUSGSWVxc9x6yVy3K411xfG+tqZZ3RsDGb7idAOgLqtBc4NaNSeAC4afgQw6+Fc2+rOmTkO+W76HZtVBVXO4QUFHE6WeZ4YxrRqSSry7CdndNguLxtmjabnUNDql/Yfi+bitfclrZY23UjMuvdPrVTN1pYnt/Jj43l6VYdUGtaj2suxrfJdf3LLAxeBdpLqERFnyyCIiAIiIAiIgCIiA4qyXmKSaY/7bHO9AXnptOv0uSZxc7tI8uEsx3fEOxegt6iM1oq4h0uheB6CvOG9U0tHdqqmnaWyRyuDgeritL7OxjxTl38iq1RvaK7jpoiLUlOFZ3km7NWc0Mzu0QcXDSjY4dH/JV+wOxzZJl1ts0I1dUzBp8g4n7AV6F4/a6Wy2altVGwMp6aMRxjsAVDruY6q1VF85f0WOn0KcuN9Ed5ERY8vAtJcsS4Mg2aMoD+UnqmOHkGuvrW7VXTlrzsZZbRAQN973EeZWGlx4suC/cjZj2pkVVREW+M2FfTk8W19q2TWele3dcWuk+s4n+qopbKY1lxp6UHQyyBnpK9GcSpxS4va6cDTm6SJvoaFnfaKzauEPFlppkf1ykZNERZMuQiIgCIiA/JHNYxz3kBrRqSepUz5UG0R2T5MbHb5ibbQPLeB4SP6z5FtzlNbUW41an47aJx7J1TNJHNPGJp9RVPXuc97nuOrnHUnxrUaHp+3/kTXp/2VGoZP/5x+p8oiLTFSFvDki4mbxmst7nj1p7cwFuo4Oc7UfYtKUkEtVVRU0LS+SVwa0DrJV8dg2FjC8CpKOZgFbOBLU9ocQNQqjWcpU47iusuX/ZNwae0t3fRE/REWINAEREAVMOV54Tm/Rh6yrnqmHK88Jzfow9ZV1oP+19GQNR+T9TTKuxyS/BFSfPSfeKpOrsckvwRUnz0n3irnX/9VeqIOm/O+ht1ERYwvQiIgCoHt3pYqTaleY4hoHTF58pJ1V+pXtiifI86NY0uJ8QXnvtbuXsrtFvVWCC3up7WkdYDjotD7PJ9tJ92xWam1wJEVadHA9hV8dkc75dhltnc4l5trzqf3SqIRN35WNHSXAK/2zS1y0WyW32t490FAWekH8VO9oGlXBfuR9NT45ehQu+vdLeayRxJc6ZxJ86+sfhbUXuihf718zQfSufMKR9BlNzo38HQ1L2HzFdG2zOprhTztOhjka4elXi518vAr3ylzPSOzxtitNHGwANbAwAf+IXaWKw+viueMW6uhILJIG6EeIaLKr82mmpNM1UeaCIi8n0IiIAqnctemjbldpqmgB7qXdPj74q2Kp7yx7sytz+koonAikptx47Hbx/oVb6Gm8tbeDIOoNdizRitvyLZXPw66RkktZUN0HlBVSFcPkcUElNs/qaxw72qn1b/AOOoV/rjSxH6ortPX+ZFeuUJ4Ycg+fb9xqgKn3KE8MOQfPt+41QFWOJ8iHov6I13zJerM3R5ZkdHTsp6a71MUTBo1rXcAub265V+3Kv66wAY8jUMcR5F+83J8R3oXt1VvuR545eJnvbrlX7cq/rp7dcq/blX9dYHm5PiO9Cc3J8R3oTsq/Khxy8TsXC5V9wlMtbVzTvPSXuJXUXfobPda5wbR2+pqCeqOMlbY2abAsmyCpiqb1H7G2/gTv8Av3eLTpC53ZNOPHebSPUKp2PaK3MNye8AqczzKCaWNzLdROE0shHAkHUN8+ivJDGyGFkMbQ1jGhrQOoBYjC8YtOJWOK02enbDBGOJ63HrJ7Ss0sTqWc8y3i7l0L7Fx1RDbvCIiryUD0KhXKG8Ll7+cb90K+p6FQrlDeFy9/ON+6Ff+z3z5en/ACVup/LXqa/V/Ng3gqsf0ZvqCoGr+bBvBVY/ozfUFP8AaH5MfUjaZ8x+hOURFkS7C88tq3hDvf0uT7xXoavPLat4Q739Lk+8VovZ35s/Qq9T+CJF0X60Fzg0dJOgU4oNlGcV1FFWU1ne+GVu8x2vSFqbLYV/G9iojCUvhRBkWwP+juf/ALEk9Kf9Hc//AGJJ6Vy/F0edfye+xs8rIJS1E9LOyenlfFIxwc1zToQQr5bAciq8n2a0Fwri507CYXOd0u3dBqquY1sJzq6XGOGooG0kG8Ocke8cB5FcXBMcpcUxikstJpuQMAc4fCdpxKoNdyaLK4xi05bljp1VkZNtbIziIizBbhEQkAEnoCA1ByldntDlGLS3iLmoLjQs3myOOm834pVKnDdcQeo6KxfKn2omuqH4hZajWmYf81Iw8HH4vkVc1uNGqtrx12nf09DP504St/SFt3kz7P6XMcpNZcXsNHQEPdCTxkdw0GnZxWolJ9muYXHCsnp7tQyODQQ2ZgPB7OsFTsuFk6ZRrezI9MoxmnPoehcMbIYmxRtDWNGgAHABfawuFZHb8qx6mvNtlEkMzQSOtp7Cs0vzuUXGTUupp001ugiIvJ9CIiAIiIAiIgCIiAEAgg9BVROVLs0rLVfp8st0JkoKt+swY38k7x+LoVu1wV1JTV1K+lrIGTwvGjmPGoIUzBzJYlvHHp3nDIoV0OFnmkvxW02jcm62XWpmr8ZrW2+V/Hud49z18WgJWi8k2PZ/ZKiRklhqKiFp4TxaFrvJx1Wzx9Txr1yls/B8iitxLa3zRNeRxYo7jndXc5m/6CASRnT4ROnqKuAq8cjay1lto7zLXUktPMXiPSRuh04FWHWV1mztMuX7Fxgx4aUERFVEwKr3LelJrMei14NbKT9itCqpctaTeyC0R/Fjf/RWuirfMj9f6Iee/wDAyu6Ii3JnjPbPIO6c6slPprzlbE3/ANQXolSR8zSxRfEYG+gLz+2Nxc7tNsTdOisjd6HBegyyntFL/JBfsXOmL9MmERFnC0CIiAKBbZdotuwPHZJpJWvuErS2nhB74nt07Au9tTzu1YJjslxrZGuncC2CAHvnu/BUYzvK7rmF/nu11nc973HcYTwjb1AK40rTHky45/CvuQczLVS4Y9ToZDd62+3eoulwmdLPO8uJcddPEseiLapKK2RQt782ERSLZ5itfmGT0tnoY3HnHDnX6cGN6yV8nOMIuUuiEYuT2RtHko4Ab7khyO4QE0NCdYt5vB7+z0FXCWFwrHKDFsdpbPb4msihYASB749ZKzSwOoZjy7nPu7jSY1Cphw94REUEkBERAFTDleeE5v0Yesq56phyvPCc36MPWVdaD/tfRkDUfk/U0yrsckvwRUnz0n3iqTq7HJL8EVJ89J94q51//VXqiDpvzvobdREWML0Iii+0DObDhlpkrbrWRtkDfc4Q7vnnsC9whKySjFbs+SkordmC2/ZrT4hgtU7nWisq2OhgZrxOo0J9BVEppHyyulkcXPcSST1lS3arnlzzvIpLhWOcyBpIgh14MaoetzpeD+Eq2l8T6mey8jtp8uiJBs8sc2RZjbbVA0kzTN1IHQO1eiFHC2CkigaAAxgboPEFWrkfYLKx02YV8O61zTFTBw6ePFw9Cs0s/ruSrb1CPSP9llp1ThXxPvKL8pXHprFtRuD3RkQ1p7oY7TgS4kkLWauZyrcImyTD47tb4d+stpc9waOLmHTX0AKmbgWkgggjpBWg0rJV+NHxXJlZmVOu1+DLdckfOIbnjJxernAq6LjE1x4uZr+JW+l5wYnf7jjN9p7vbJ3RTwu14HpHYVdzZFtUsedWmL3eKlujW+7UrnaEHtHiVDrOnSrsd0F+l9f2LLBylKPBLqjYaIioSxCIuje7vbbLQSV10rIqWnjGrnvOi+pNvZHxvbqcGWXyhx2wVd3uEojgp4y4knpXnzm99nyTKrheahxL6mYvHHoHQFsblBbW582rnWm1vdFZoHcND+WPxitPrZ6Pp7xoOc/if2RRZ2SrZcMeiPuKN8srYo2lz3HRoHSSr+7EbE7Htmtqt8jd1/N864dhdx/qqm8nXCqjK87pp3Qk0NC8TTPI4ag6gedXmjY2NjWMAa1o0AHUFA9oMlNxpXdzZI02prexlCeUJ4Ycg+fb9xqgKn3KE8MOQfPt+41QFaLE+RD0X9Fbd8yXqy9GxfGseqtm9pnqbJb5pXQgue+BpJ4duimXtSxf5PWz+Wb+Cwew3wYWb5gepTdYLJsn20ub6s0VUI8C5dxhPali/wAnrZ/LN/BPali/yftn8s38Fm0XDtZ+LOnBHwMfR2Oz0Tt6ktdHAe2OFrfUsgiLy231PqSXQIiL4fQiIgB6FQrlDeFy9/ON+6FfU9CoVyhvC5e/nG/dCv8A2e+fL0/5K3U/lr1Nfq/mwbwVWP6M31BUDV/Ng3gqsf0ZvqCn+0PyY+pG0z5j9CcoiLIl2F55bVvCHe/pcn3ivQ1eeW1bwh3v6XJ94rRezvzZ+hV6n8ESN03+oj/fHrXohs1/MKzfRWrzvpv9RH++PWvRDZr+YVm+itUn2i+XD1OWl/FIkKIiyhchERAEREAWnuUhtNjxCwutNulabrVtLRoeMTe31Kc7Tcyt2E4vUXaukbvhpbDHrxe89H26KhWYZDcMnv8AU3i4zOklneSAT70dQHkCu9H078RPtJr9K+7IGdk9lHhj1Zi6iaWonfPM8vke4uc4niSV2bLbau73Snt1DC6WoneGNa0a9PWum1pc4NaCSToAOtW15Ley5tnt7csvMANbUsBp43t/JN7fKdVp87MjiVOb69yKjHod0+FGidq2y684FHRz1es9PURgukA4MfpxaVr9ei+d4xb8txyps9wia9srCGOI4sdpwIVC9oeJ3DDsmqbPXxuHNu9zfpwe3qIUPStS/FR4Z/Evud8zF7F7x6E65Oe02bDcgZbK+VzrTVuDXAnhG4/CH2K6lLPDU07KinkbJFI0OY9p1BHavM8Eg6g6FWh5K21Lnoo8OvdR7owf5SV7ukfFUTW9O4l29a59/wD2d8DK2fZy+hZNERZQuAiIgCIiAIiIAiIgCIiAIQD0gFEQH41rW+9aB5Av1EQBERAFU3lpxluT2t/U6J39FbJVa5bkW7crDLp79kn9FbaK9syP1/oh56/wMreiItwZ4newVgk2p2YHqmB+0K/SoPsBcG7VbOT+lHrCvwsj7Q/Pj6F3pny36hERZ8sgoTtV2iWbBLM+prJWyVbmnmacHvnH8Fits21ez4LbpKeOVlRd3t9zgB97r0E9ipfmGTXbKrzLdLvUvmmeTugngwdgV1pmkyyXx2co/wBkDLzFUuGPU7m0TNLxm18kud1nJBPucQPesHYFGURbKEI1xUYrZIo5ScnuwiL7hikmmZDEwvke4Na0dJJ6l6PJzW2iqbjXQ0VHE6WeZwaxrRxJKu3sA2aU+DY+2oqWNfdapodM8j3gPwQolyatkXsFTsybIacd3yt1ghe38kO0+Nb+WR1jUu1fY1v9K6/uXeDicC7SfUIiLPlkEREAREQBUw5XnhOb9GHrKueqbcsKmmi2jwzPYRHJTAtd1HiVdaC//K+jIGo/JNJrfGxvbpbsFwyGw1NkqaqSN7nc4yQAHUk9a0Oi1uTjV5MOCxboparZVS4olrP8Utm+TNZ/GaviXlTWkMPN4xWF3V7s1VWRQfcmH5fuyR+Pv8TfWU8pXJK+B8FnoYaFr+G+4avHkIK0vkN9u+QVzq28V81ZOfhSO10WNXLTQTVM7YKeN0sjzo1rRqSVMoxKMf5cUjhZdZb8T3OJbE2KbNblnd/j9ydFbIXB08xHAgH3o8almyPYHecgljuGSRyW6g1BEbho947NOpWwxbH7VjVoitdopWU9PGNAGjiT2ntKq9S1iFUXXS95f0TMXBlN8U+SOzZbdS2m2U9voomxwQMDGtA7B0ruIix7bb3ZeJbHxPEyaF8MrQ5j2lrmnoIKpvyitk9ZjF4nvtqhdLaql5e4NGvNE8Tr4lctda6UFJc6CWhroGTQStLXscNQQpuBnTxLOJdO9EfIx43x2fU8012bbX1ltrGVlBUyU9RGdWSMOhBVgdsPJ7q6J8t1w9rqiAkudS9Lmj/j2qv1yoK221TqWvppaadvvo5G6ELbY+XTlQ3g9/2KC2mdL2kjcuGcovK7RC2mu0cdzib8N35Q+fVT+m5UdmdCDPjtW1+nECVqqkij26TiWPdx/g6QzborZMsnkHKhqZWPbZbFzDugOncHepaVzfPsnzCcvvNylki11bADoxvkCiy/V2x8DHx3vCPM8WZNtnKTPxZnD8bumU3uC1WqnfLLK4AkDg0dpUo2bbJspzKsi5qilpaAnV9TI3Runi7Vb3ZZs1sWBW7m6CIS1cgHPVDx3zj4uwKLn6rXjRcYveX/AN1O2Nhzte75I5NkWDUeC4rDbIQ19S4b1RKB753X5lM0RYqyyVknOT5svoxUEoooRyhPDDkHz7fuNUBWxOUbTT0+2C+OljLWyyhzCfhDdHFa8AJIAGpPQv0PEf8Agh6L+jM3fMl6l/dhvgws3zA9Sm6h2xemmpdmtmjnYWONO12h7CApivz/ACed0vVmkq+BegREXE6BERAEREAREQA9CoVyhvC5e/nG/dCvqehUR5SFJPTbXLwZoy0SPa5hPQRuhX/s8/8APL0K3U/lr1NcK/mwbwVWP6M31BUEa0ucGtBJJ0AC9AdiVNNS7L7HFOwsf3Kw6HpHBT/aF/4Y+pH0z5j9CZoiLIl0F55bVvCHe/pcn3ivQ1ee+2CmmpdpF6jnYWONS9wB7CdQtF7Ov/LP0KzU/giRSJ25K1+mu6QVZfFuUpabPjtDbJMdq5H00IjLhM0A6KsyLR5WHVlJKxb7FXVfOl7wZaz/ABS2b5M1n8Zqf4pbN8maz+M1VTRQ/cmH5fuzt+Pv8S1n+KWzfJms/jNT/FLZvkzWfxmqqaJ7kw/L92Px9/iX22X7VsczwOhoZDT1rRq6nkPfaeI9amt2r6W2W6evrJWxQQsL3ucdAAFRDYHLXRbVbJ3CX7zpw1+71t69fErNcq6e4Q7LZBSF4Y9+k5b1N4f1VBm6bCrLhVB8pfYsqMqU6XOS5ordt12h1Wd5RI6ORwtlM4tpo9eGnxvKVrpFMtkmD1+c5TDbqdjhTMIdUS6cGN/Fa2KrxadukUUrc7p+LZO+TPswflF4Zf7rAfYuldqwOHCV34K40TGxxtjY0Na0aADqWOxeyUGPWSntVuhbFBAwNAA018ayaw2fmyy7eJ9O40ONQqYbd4Wsdv8As3p85xp81PGG3SkaXQPHS7/ifEtnIo1N06ZqcHzR1sgrIuMjzRr6SooayWkqonRTROLXscNCCv231dRQVsNZSSuinheHse08QQrN8qfZZ3RHJmNip9ZW8ayJg6R8by8fsVXFvsPKhl1Ka+qM5fTKmfCy82wDaPT5xjTIKiVoulI0NnYTxd/yWz1R7kvT3CLapQsoi/cfwnA+Jrx1V4Vj9WxY42Q1Do+Zd4Vztr3fcERFWEsIiIAiIgCIiAIiIAiIgCIiAIiIAq1ct2mc+nsFSBwj5xpPl0VlVo7ljW8z7O4a4N1MFS1vp1/BWOlT4cuDIuZHemRTtERb0zhmsHuvsHltsuu9utp6hj3n/iDxXoZj9zpbzZ6a40krJYp4w8Fp1HEdC82VMMR2k5ji1L3JabzURUo10h1BaD2qo1XTXmJSg9mibh5ao3TXJnoBVVNPSwumqZmRRtGrnOOgAWgNtW36ht0M1nxCVlVVuBa+qae9j8njVd8o2g5fkjTHdr5VTxH/AGy7QfYouSSdSdSouHoMa5cVz3/buO1+ouS2gtjtXW41t0rZK24VMlRPI4uc951J1XURFoUklsit6hEXesdpuF6uUVvttM+oqJXBrWtGq+NpLdhLfkjrUsE1VUMgp43SSvOjWtGpJVquTzsUbaWxZJlFOHVjgHQUzx+S8Z8az+wzYtQYlTxXa9Rx1d2cA4ajVsXk8a3OAANAspqmsdpvVT0734lxiYPD+uzr4AAAAAaAdSIizpaBERAEREAREQBQnats4s20C1imuGsNRHxhqGDvmKbIvddk6pKcHs0eZwU1tLoVcl5LlZzh5u/xlmvDeHH1L4/wuXD9vxej+ytMisvfWX5vsRfwFHgVZ/wuXD9vxej+y+mclyt17+/x6eIf2VpET31l+b7D8BR4Fe7FyYbHTubJc71VVJ64wxob6elbTw/Zph+LxgW2zwc6OmR43iT51MUUW7PyLuU5s6wxqq/hifjWhrQ1oAA6AF+oiiHcIiIAiIgCjeVYNi2TQOiu9op5ifhhu670hSRF6hOUHvF7M+SipLZmhb/yZsYrC59uudVQnqY1oI+1ReTkt1O97nkDS3xt4+pWiRWENXy4LbjI0sKl/wDqVutHJcomyB1yyGcgfBiY0g+kLY+IbFMGx6Vs7ba2rqG9Ek2p+zoWykXO3Usq1bSmz1DFphzUTipaeCliEVNDHFGOhrGgBcqieWZ5Z8erm0dSXSTEauDPg+VdOfabj/8Alm0jpKqWd4YWMGhbr26qCSCcIvxjt5gdppqNV+oDW22DZJZdoLGVEkjqO4RjRs7ACSOwqC4Pya7barxFX3m5urWQvDmwho3XEdqsGim16hkV19nGXI4SxqpS4muZ8U8MdPAyCFgZHG0Na0dAAX2iKEdwiIgCIiAIiIAiIgC15tb2UWLaBCySpc6kroxoyojALtOwrYaLpVbOmSnB7M8zhGa4ZLkaEwfk3Waz3iO4XW5S3ARODmQloDSR2rfEEUcMLIomBjGDRrQOAC+0XTIyrch72Pc8VUwqW0EERFHOoWqNsGxazZ3Ui5RTuoLiBo6RjQRJ2ara6LrTfZRPjrezPFlcbFwyRVo8lyv14X+L0f2X5/hcuH7fi9H9laZFYe+svzfYjfgKPAqz/hcuH7fi9H9k/wALlw/b8Xo/srTInvrL832H4CjwKs/4XLh+34vR/Zfo5Llf13+L0f2VpUT31l+b7D8BR4Gq9j+xizYHUG4PndX3EjQSvAHNjsC2LkNoob7aKi13GBs1PO0tc0rvooFuRZbPtJvmSIVQhHhiuRWy6cl6mkujpKG/SR0jn67rmjVo7BwW5dmWA2XA7P3DbI9+V3GWdw755UuRdr8/IvhwTlujxXjVVviiuYREUM7hERAcdVTw1VNJTzxtkikaWua4cCCtAZtyarZc7vJXWW5uoY5XFzoC0brfIrBopOPl3Yz3rexytphatpo1vsf2S2bZ9G+eKR1ZXyDR07wAQOwLZCIud107puc3uz1CEYLhiuQREXI9hERAEREAREQBERAEREAREQBERAFD9s1lF+2cXeiDN+QQOkjGnS4A6KYL8e1r2lrgC08CD1r3XN1zUl3HmUeKLTPM6aN0Mz4njRzHFpHjC+FsXlA4dPiOf1bBEW0dW4zU7tODgen7dVrpfo9Nsba1OPRmXnBwk4vuCIi6HgIiIAi7NtoKy5VkdJQU0lRPIdGRxt1JKsLsm5OtTVc1c8yc6ni4ObSNHfO8TujRRsnMqxo8VjO1VE7XtFGpdmmzjIc5uDIrdSvZSg+6VLhoxo69D1lXE2V7LsfwOiaKWJtRXEe6VLxq7Xr07ApbYbNbbFb46C10kVNBGNA1jQPT2rILH5+q25T4Vyj4f9l3jYcKeb5sIiKqJgREQBERAEREAREQH44hrST0AaqI2jPLZcsoksUTHCQEtY/4xCls35F/7pWgMB8LsXzz/UUBufL8hpMbtZraoF3EBrR1lcOGZXb8npHS0rt2Rh0fGekKLbfPzai/fHrWp8Tu1xxm5Ut2ia8QSE6g+9kaDxCAsdk15prDaZbhValkY6B1rr4bkdJkts7tpWloDi1zT1FRPaXdaW87NjX0jw+OQA8Oo9i4+T/+bM/zxQE9vV2oLPRuq7hO2KIdvSfIte3DbDbYagspaF88YPvy7d+xQ3aDc6vLM6Fqp5Hcy2UQMZrwDgdCfStn2PZzjtDQNinpBUSlvfvcekoD9xXaJY75IynMnc9S7oY/o9Kkd+ukFotc1fUamONuug61pfavhkWNyQ3W0F8cDncWg+8Pbqp5g9aMu2evp6s78246FxPHoGgKAzGEZbQ5RTSyUzTHJE7RzD61IJ5GQwvledGsaXE+ILQWzWtlxrP3W+o1YyR5hIPR08D9i2dtdvXsTiUojfuzVPeR8fT9iA5MWzu23++zWumY4OZqWO6ngdKk1xq4aChmrKh27FE0ucfEtXbAbEY6eovkzeMh5uLUdGnT613Nut9NLaobTTv0lqT3+h+D2IDJ4ttItt8vZtgiMLnEiJxPv1OlWa4WS4YvHabwS5pmAf0abp1PD0KxGNXSK82SluMRGkzA4jsPYgOzca2lt9I+qq5WxRMGpcSteXfa7aaaoMdFTPqmj4RO6o5twvlRWXyOxUz3iOMDea0++JUtwvZxZaS0wy3CDumplYHOLuga9SA+8c2o2S5zsp6kOpJXnRoPEa+VT1jmvaHNIIPEEKA3LZXYqi4xVdLLLRhjg50bRvB3pPBTynibBAyFnvWDQaoCCZvbcYsc1Tkd1pu6pp9GCN/EE6dQ6uhYvZpR4ffK+S4UVCYauE73NOdq0eMKP7W7jNkWY09gonbzY3CMAHg5x4rHY+6owbaEyknc7mHPDHE8N9p/ugLBrGZDfrZYaXui5VAib1DpJ8gXfM0YpzPvDcDd7XxKvd7mrc4z/uATPbEZubb1hjQdNdEBNarbFQMqCyC3vljB4PLtNfMpTimd2S/ubBDNzVSf9t/D0dq47ds7xmloRTvohK4jvnuJ1JWrNpmLnD7tT19qkkZBI7Vh14sI6kBYFFgNn949nMWpK4nV5buPPa4cCs+gI9muVUOL0kc1UHPdI7RjR1qI/wDWC1/qb/SulyiP9Pb/AN8+pfGHRbOjj9MbrV0LKvd90D5dDqgM7Y9qVquVzhoe53xumdutPTxWwgdQCOtQ3Gbfgc9eJLI+iqKiLvhzb94jxqZIAsTkeQ2uwU3P3GoEYPvWjiT5lk6iVsMEkz+DWNLj5Aq81jq3Os+dSulfzPOlo46hrAenRATao2x0DKgsht75I9eDy7TUeRSzFM4smQubDTz83UkamN/D0dq4KPZ5jFPQimdQiQ7ujnknUlap2jY3Jhd8grbZK9lPI7WI66FpHEhAb/q546WlkqJToyNpc4+IKNYbmtBktfU0dOxzJIdTx6266ar8orr7M7OJK4nVzqVwef8AkBxWudgX533D5g/eCA3bUysgp5J5DoyNpc7yBRfEc4t2RXOehpmOa6Pi0n4Q7Vn77/2Wt+Yf6itJ7Cfzwk+bKA3yoLle0i22K9C2mIzuadJXA6bilOSXKK0WWqr5SAIoyQO0qvNvslflMN5ve85zoRv9Gu+7UcPQgLHWytguFBDW0zt6KZgc0+IpdK2G3W6euqCRFAwveR2Ba52EX3um1S2ieTWSnOrNT8HsUx2ifmNefoj/AFIDrYTmNDlBnbTMdG+E+9PWO1SdaX5PP/ca/wCb/qFuhAY3JbvT2O0TXGp1LIx0DrPYupheS0mT219XStLCx269p6isRtn/ADEqfnG/1WD5PH/YLj8+37qAzuYbQbZjtxFDJG6WUDVwHUsNFtftDngSUsjW68T0qEbVWNl2itjeNWvkY0jxFwW0js8xapomtdQbpc33wcdQUBmMcyez39mtuqmvcBqWHg4eZZlV0v8AQVmAZlGaOd5iJD4z0bzesFWAs9YyvtdPWMPeyRhyAxuaZNR4xbRV1Q3nOOjGDpcV18Fy+iymlkkgYYpozo+MnoWrtqFfNlGcw2SkJdFC8R8OOjtdHFdXEJqjCdofsfVOIje7m3a8BoegoCwCg2VbSLXYrq+3uifNJHweRw0PYpwxwe0OadQRqFXjMoI6natLBM3ejfVhrh2guQE9g2vWd8obLTSMaTxI46KbY/kNqvsJkt1S2XTpb0EeZYSu2cYtU07o20PNOI4Oa46grUkzK7Ac5EUUzzE2QeIPaUBv+93GntNsmuFUSIom6nRa9O2C168KOTTyrP7TJmVGzmtnYdWvjYQf/ILV+ytmIugqvbJPSxP1HN86/d1QExZtftRcAaOQAnp1WxrZWRXCghrYCTHM3ebqoLRUWzGpqo4aWpt8sznaMY2XUkqf08UUEDIoWBkbRo0AcAEB9oiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAgW2rZ7SZ9jL6Q7sddD31PLp0HsPiVHMosFzxy7T226U0kM0Ty07w4HyFekCjWa4PjmXUhgvNvjldpo2UAB7fIVcabqrxP0TW8f6IOXhq79UeTPO9FbS58mLHpJy6hulTDGT7153tF38c5NuJUFQ2e41NVWOaeDd7Rp8o0V89cxEt93/BXLT7t9tipFstlwudQynoKSaokedAGMJW5tnnJ2yO8SR1OQu9jKQ8SzXWRw8XUrUY7iWO4/EGWm00tNoNC5jBqVmxw6FVZOv2T5VLb+yZVpsY85vch+B7N8Vw2na2126Mz6aOneNXuUwRFQ2WTslxTe7LGMVFbRQREXg9BERAEREAREQBERAEREB8zfkX/ulaAwHwuxfPP9RVgJBvMc3tBC1ViuCXi37RHXeoawUkb3OY8OGrtRp0IDu7fPzai/fHrWNwzGqfJdlbKV7Widr3mF/YdSpVtWx6uyCwCnt4a6djgQ0nTXzrt7NbLVWHFoKCs0EwJc4A66alAaDrKu6WWmrsdqg4RudoWO6j2hbX5P/HGagf8A1iu3tUwU5DE2ttzGtrmcCNQA8Lv7KMdrsdsDqe4BrZnyFxaDrp50BqO4B+MbTnVFW3Rrarnj+652qsJb66lrqSOpp5mPY9oIIcoztCwijyiAStcIK1g0bJp0jsK1mcLz+1vdTUEsvM68CyYAHzICTbeb5R+xcVpikZJO9284NOu6Fl9h1umo8RE0w3TO8uAPZrwKjGL7LbjU1zK7I5zoHbzo97eLvOtwUlPFS07KeBgZGwbrWjoAQGlduFpfbsgp75TNLWy6bxHU4dHqWEzHIZswrrXRwBxAY1rm/wDLXQn0LdO0CwDIsdmomgc8O+iJ+MoBsu2f3O3X8XG8QNjZDrzY3gdSgNl2ChhsWOwUvBrKeHV57SBxKr5md6mvGYz1zIjOyKTRjNCQQPIrBZbSVldj1XSUDw2eSMtbqenUdCiGynCJrJDPUXiCM1Mp0a0kO3QgNc5XmV2yG0R26qs0UccWhY9jHat0Gil2wO/EsnsU7tN3v4gftH2Lab7bQuaWmki0I096tY0mBXe27RfZK3hsdv5wvDg4d6D8HRARja9TTW3PRXubrG/dc0nr06VunFrtR3Wy01TTTMcDGNRrxBXUzfFqPJ7b3PP3kreMcgHFpWjLpbL9i99Fooq9/OynRohf0+UdSAsHcr5ardLHFV1sUb5DutBPSVwZbeIrPjtTcd8atYeb8buparsGzbIblXsrL/Uuja1wcdX7znejoUw2o41dbtj9Lb7P37YiA5jnaagdB1QGmrDfK635C6+RUQq5i8uG+0kAk+Jc+a5FccjrIq6rtzaWSFum/Gxw6+vVb0wbF6ayY9BR1EEb59NZHEa8V377YaG42moou5ommVhAIb0HqQGA2Y3j2fwtsD3+7xMMTtens1WqseqhjG0svrxuRtnLXkjoaT0rYOyfEr5jlzrXV26ymfwaA4He8fiWR2ibP6bJD3ZSvbT1oHF2nB/lQEzp6qnnhbNFMxzHDUEOC0/t7vVLVSUlrppGySRkufu8dNViRh+0Oh3qSlkmEOug3ZwAQpBhuy6obXR3HIJg9wO8YtddT4ygJdsjt01twikhnGjnl0nmcdQpcvmKNkUbY42hrGjQAdQX0gNR8oj/AE9v/fPqWOxXZlQXeyQV8lxkjdK3UtBHBTDa9itxySipvY0NfLC4ksLgNR5SoHTYTtHpoWwwPfHG3oa2pboEBsDCMAt+N3N1dFWyTyFu6GkjRTladxnF9odPe6aatqpG07Hgv1nDgR5FuFuoaAenTigOG4RGehngb0yRuaPOFXzDa1uM7RH93Dcbzjo3E9QJ6VYpQHaJs9p8hk7uontp6wDidOD0B2tp9yu8WMsrMdmBIdvSPYQSGaLTuWZjWZJZKChrWb1RSyOJk+PqAPSsz7T9oVK11FA+XmOjQTjQhfUmyfIWW8VLHxuqtfyO8PTqgNi4hbZqXZd3IQTJJA54H7w1WvNilZDb82qoal4jMrHRt1Onfb39luDDKKuosapaS5v36hjdHcddB2LXWcbMq19zfc8feN553jHvbpB8RQGx8srqajx2tmmlY1vMuA49JI0WodgcMkmTT1AadxkffHs1XB7Sc+ujm01fJJzA6S+YEDzLa2z/ABOnxe2mJrucqJNDK/tQEJ2+X3SKCyU7++cd+UD1KI4tmV2x+zSWyls0Ukcupe57Hau1GimdZgd3uW0V1zuAa+3iQP3t4d8AOjRbNbbqFrQBSQ8Bp70ICt+G3maz5hBXuiNOySTR7NCAAfKt8Z5KyfZ/dpozqx9E9zT4iFG9q+DTXuKCps8EYqI+Dmghu8FnaWx18uzx9iq5R3VJTGIu6d3UIDX/ACe3Nbca/ecG+59Z8YW5hLEToJGfWC0HTbO86oJXmhYIgTpvMnaNQu5Bh20kTMJqJGgEce6AdEBP9s/5iVPzjf6rB8nj/sFx+fb91SbMLHX3bBPYtrxJWiNupJ984BdPZFjdfjlkqIbi1rZppA/dB100GnSgNabUfCTF87H94LfNPPCykjc6WNoDRxLgtVbTcDv12yP2RtTGStcAeLw0tPnWF9o20OdohqJn80eB1qARogOvtgusF+y2npreRMIBzYLfhEkLaFdWe1XZ210zhzkdPutHaSP7rE4Hs0p7LVNuFylFVUji1unBp/Fdra7jt4yC30tPaw1zWP1ewuA4IDTWMX2vtN8deoaIVk53uMjSRqenoX3mV/r8huDLjVW9tLKwaF0bXDXs11W+8Nxmks2P09FLBE+UN1kJGurutdjI8forpZqmiFPEx0jCGuDeg9qAx+y++ezmLQSvdrPEObk8oWpcpIG11xPD/Ot+8p9sjxa947U1nshusp38GMDgdT2rAZ/s/wAir8qnudqYyRkrt8O5wNLTr40BuCWpp4mF8k0bWgaklwVfdo1wjyTO2xW73VrXiNjh8I9ayJwXaDV6Q1c7+ace+1qAVOcA2dUmPzCtrJG1VX8EkcGf3QHZ2g05pdmFVTk6lkTB/wCoLVezbC6XKYamSoq3wGEjTTTjqt35rapb1jNZbYHBskrRuk9oOq01Q4Bn9BvNom8yHdO5UNGqAmFq2UWuiuMFUbnK/mnh27qOK2axoawNHQBotGsxHaYHtJqJQNenukLcthhq6ez0sNfJztSxmkju0oDvIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCL5mLmxPcxu84NJaO0qLy3nJWBzvYPvRx11QEqRQq0ZTfbpSd1Ull3o99zNdesHQ+pSey1FbU0pkr6XuaXXTd8SA7yKIR5Nd6utrIbdaTNHTTuhLtektOi5vZjJ/2F9qAlKLo2WorqmlL6+l7mk14N8S4r/e6SzwtdPvPkkOkcTOLnHxIDJqItwS3+28ZE+okklDt8RuGoB8uq+/ZbKphztPZY2RHiGykh+nmXZtGUMnr2W240k1DWu4NbIODz4kBIkWJyC8C1SUjTHv90SbnkXbvFYLfa6muLd4QRl+nbogO2iiFFkOQ1lKypgsm9FINWnXpC5W5ZLRyBl7tlRRNcdBKR3iAlSL4p5o54WzRPD2OGoI619oAii9blsNPk8Vp5kmEu3JJupj9NdPQpQDqNQgCLguNZBQUUtXUvDIomlziexRpl+v9c3n7ZZx3OfeumOhcO0aICWIo7aMjlmuLLbcrfPR1TwSzeHeu07CpEgCIopV5Jc3Xqqt1uthqO5zo5yAlaKLezGT/sL7Vl7FVXGqjkNwou5XA96O1AZJFiqG7ipvtXbOb0NONd7tWRqp4qaB88zwyNg1cT1BAciKKe2S5XEk2K1ulhHRNNwY7yaL8OTXG2u1v1rfDCT+Wi4sb5dUBLEXHTTxVEDJ4Xh8bxq0jrXIgCIutc6uOgoJquU6NjbqgOyiwGG5EL9TSvfA6nmjdoY3dOnUVn0ARF1LvWCgttRWFu8ImF2nboEB20UQo8gyKrpYqmGx6xytDmnXpBXM275NqNbFw8qAlKLqVFU+ntUlXLHuvjiL3N8g10XxYq8XO009cG7nPMDtOzVAd5Fi79e6S0Rs57eklkOkcTOLnHxLEey2VTDnoLLGyI8Q2UkP08yAlaKP2bJoqqtFurqaWhrdNebk4B3kUgQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBcVX/ppf3SuVcVX/ppf3SgIzsr/Nc/Spv/AHHKVqKbK/zXP0qb/wBxylaAheCVlHT1d7ZPVQRO9kZuD5A0++8alPspbP2jSfxm/ioZh9ktlxr73NWUscrxcJRq4a/CUj9qlh/Z0P1QgMw2WN0XOse17NNQ5p1BUSxaFt4yG43yoHONimdT04d8EN6/tUqhpooKUU0LAyMNLQAOhRXBpm0F1u1imIbKypdNHrw3mO6NPQgJguGWlp5ZY5ZImOfGdWOI4grmX45zWkBzgCeA1PSgIltD/wBRZ/pP9Fl8z/NS6fRn+pYjaH/qLP8ASf6LL5n+al0+jP8AUgPzDPzZofmgsnV00NVA+CeNr2PGhBCxmGfmzQ/NBZd7msYXvcGtA1JPUgIhhrn2u/XDHnuJij0lg1PQ13UpDf7lFabRUXCXi2Fhdp1nxKPYwfZTL7neY+MDWiCNw6HFvSV1c7raqsvdHaaGkNYyF4nqWA6Dh0NPlBQHLSY46pw+fn/9dVHuhz+sOHR9gCzmH3P2Ts0b3/l4vc5h2OHSsa2/X5rA0Y2dANNOd/ssRjVdWW3L5Yq2gNFT3ElzAXajfHE9SAkefUdRW43NHSt35GOEm58YDXgvnHcmtFZRxQ8+2mmYwNdHN3hBHDr0UgJAHEjisZcrBaLgS6poYXPPwwwb3pQGRYYZdJGFj+xw0P2r7UFraOXEbpRz0FXPJR1EnNyQSvLtNegt16OlToHUAoAodj88EOaXvnZo49X/AAnAdimKgNBZaG6ZreTVted1/Dddp2ICbd3UX65T/wAQfiuaN7JG70b2vaetp1CwHtOsv6OX+Iszb6OGhpW01OCI29Gp1QEbsX5+Xf8AdH9F85mXXO922wNcWxyOMk/jaBqB9i+rF+fl3/dH9Fx5YfYvLLVeZD7g8mGQ/F4aA+koCWU8MVPC2GFgYxg0aAOgJVQRVMD4JmB7HjQghfbXNc0OaQQeghHuaxpc4gADUkoCIYMX2+9XXHy4uip3c7Br8GMnQD7Cpgohhx7vyq83mPjASKaN3U4NOuo9Kl6AKKZe99zu9Fj8J1Y887VadTBrp9oCk1XPHTU0k8rg1jGkkla8xu43vu6tvTbK6p7sfrE4vI3Y+HDTTtBKAzF6YbFlFHc4W7tLUAQVAA4A9DftKmAIIBB1BUFyGuvl2tM1E7Hi0vHeu533ruo9CzOA3KSvsMcdQN2qpvcpmnpBHD+iAkKxGZfmxcPmHepZdYjMvzYuHzDvUgOPE6yjbjVua6qgBFOzUGQfFCyjaykc4NbVQOJ6AJAVFMZxO0T4/QzSRy774GOOj+sgLK0uKWimqGTxRyh7DqNXoDvZF/2Ku+Yf90rpYH+aVu+Yb6l3ch4WGtH/ANu/7pXSwPjiNu+Yb6kBicPYy9Xqvv1SN/m5TDTg9DA3gftCmShuz5zbdWXOxzuDZ46h0rAelzXEu1HpUyQEdzu0sr7NJUxgMqqQc9FIOkbvHTz6LIYxXG42Kkqz758Y3/3tOK4MzuEVvx+pc8jfmYYY268S5w0H2lfeIUb6DHaOnk9/zYc7xEjUoDLIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAL4naXwvYOlwIX2iAweE2mos1lNHVOYZOekf3h1GjnEj1rOIiAhFFa8utNfcHW6K2ywVNS+Zplmc1w3jr1BdznM9/VLP/MO/wD5UrRAY+xOu7qZxvEVNHNvd6IHlw084C6WR4825TR11JOaSvh95M0dPiPaFnUQESbU5vAOZdQ2+oI4CUyuGvjIAXNbbJdaq4Q3G/Vu9JCd6KCE6MafLw186k6IDBZVaKi6S0DoHMAp5t928epd/IKSSvslZRRFoknhcxpPRqQu8iAhVrps5t9BFRxU1pcyJu6HGd2p/wDSuw+0ZLd2mK8V8VLTn30VN32+OzUgEKWogOtbqGnt1EylpI2sjYNAO3yrGYvaJ6GWsrK5zH1dVKXEtOoDR70ehZxEAWFy2zvu1CwU5ayqhkbJE89RB1WaRAYm7Wl91tEVPPUSQVDN13OROI0ePWFiWnNaD3FkdDcIxwbJI8sd5wApYiAitHZ7vcrnBX5A+Fracl0VPCdWg9pJAUqREAWDs9pqKTILjXyOYY6l2rADx86ziIAiIgMHbLTUU2TV1ye5hiqAA0A8Vkbtb6a50MlJVMD43jzg9oXbRAQ+GiyuyNFPQSU9xpG8GCdxa5o7OAOq+paLKb20wXGWnt1I7g9tO4uc4dnEDRS5EB1rXQ01uoo6SljDI4xoB2+VdlEQGHy231l0tgoaV7WMleBOSdDudenjWTpIWU1NHBG0NYxoAAXKiALAUNnqaLKqivp3MFHVM1lZrxDxwGg9Kz6IAujf6SSvs1VRxEB8sZa0no1IXeRAdKxUslDZqSklIMkMLWOI6NQNF3URAda6076q21NNGQHyROY3Xo1IIXWxihlttipKKctMkUYa7dPDUBZJEBgcjx5txqIq+jnNJcIfeStHSOwjrXQbU5vAOZdQ2+cjgJedcNfGQApaiAi9vx+trK+K45DUNnkj4x07B7mw9vj86lA4DQIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiA//2Q==`

export async function gerarEImprimirFormularios(dados) {
  if (!dados) return

  const valCiclo = Number(dados.ciclo || 0)
  const cicloStr = String(valCiclo).padStart(3, '0')
  const maquina = dados.maquina || ''
  const lote = dados.lote || ''
  const desc = dados.descricao || dados.titulo || ''
  const emp = dados.empresa || ''
  const imp = dados.impressoraRede || ''
  const fusos = Number(dados.totalFusos) || 96
  // Código completo: máquina + ciclo com 5 dígitos (ex: TF07B00001)
  const maqCiclo = `${maquina}${String(valCiclo).padStart(5, '0')}`

  const torcao = (() => {
    const match = (desc || '').match(/\b(SO|SZ|S\/Z|Z\/S|S|Z)\b/i)
    return match ? match[1].toUpperCase() : ''
  })()

  // Fusos divididos em dois grupos de 36 (total 72), ou conforme totalFusos
  const metade = Math.ceil(fusos / 2)
  const col1Count = Math.min(metade, 36)
  const col2Count = Math.min(fusos - col1Count, 36)

  // Sempre renderiza 36 linhas; mostra número se fuso está ativo, linha em branco se inativo
  const renderFusoRows = (start, totalAtivos) => {
    return Array.from({ length: 36 }, (_, i) => {
      const fusoNum = start + i
      const isAtivo = fusoNum <= totalAtivos
      return `<tr class="${isAtivo ? 'ativo' : 'inativo'}" data-fuso="${fusoNum}"><td>${isAtivo ? fusoNum : ''}</td><td></td><td></td></tr>`
    }).join('')
  }

  const defeitos = [
    'Bobinas com Pêlo', 'Bobinas Suja', 'Tubete Amassado', 'Sem Entrelaçamento',
    'Defeito de Enrolamento', 'Torção Errada', 'Tubete Errado', 'Fio Trançado',
    'Bobinas com 01 Cabo', 'Bobinas sem Reserva', 'Bobinas com TMT', 'Fio Podre',
  ]

  const css = `
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Arial Narrow',Arial,sans-serif; }
    .page { width:210mm; height:297mm; overflow:hidden; display:flex; flex-direction:column; background:#fff; font-family:'Arial Narrow',Arial,sans-serif; color:#000; }

    /* ── FORMULÁRIO 1 ── */
    .f1 { display:flex; flex-direction:column; gap:5mm; flex:1; padding:12mm 14mm; }
    .titulo { text-align:center; border-bottom:3px solid #000; padding-bottom:4mm; }
    .titulo h1 { font-size:32pt; font-weight:900; letter-spacing:2px; text-transform:uppercase; }
    .titulo h2 { font-size:12pt; font-weight:400; letter-spacing:3px; text-transform:uppercase; margin-top:1mm; }
    .campo { border:1.5px solid #000; padding:2.5mm 4mm; }
    .campo label { font-size:7pt; font-weight:700; text-transform:uppercase; color:#555; display:block; margin-bottom:1.5mm; }
    .campo .v { font-size:13pt; font-weight:700; min-height:7mm; }
    .campo .v.lg { font-size:16pt; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:4mm; }
    .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4mm; }
    .ciclo-box { border:3px solid #000; padding:5mm 6mm; display:flex; justify-content:space-between; align-items:center; }
    .ciclo-box .esq .label { font-size:10pt; font-weight:700; margin-bottom:2mm; }
    .ciclo-box .esq .num  { font-size:52pt; font-weight:900; letter-spacing:1px; line-height:1; }
    .barcode { border:1.5px dashed #999; width:50mm; height:22mm; display:flex; align-items:center; justify-content:center; font-size:7pt; color:#aaa; text-align:center; }
    .checklist { border:1.5px solid #000; }
    .cl-header { background:#333; color:#fff; font-size:8.5pt; font-weight:700; text-transform:uppercase; padding:2mm 4mm; }
    .cl-body { display:grid; grid-template-columns:repeat(5,1fr); }
    .cl-item { padding:2mm 3mm; border-right:1px solid #000; }
    .cl-item:last-child { border-right:none; }
    .cl-item label { font-size:7pt; font-weight:700; display:block; margin-bottom:2mm; }
    .cl-linha { border-bottom:1px solid #ccc; height:6mm; margin-bottom:2mm; }
    .cl-row2 { border-top:1px solid #000; }
    .cl-span2 { grid-column:span 2; border-right:none; }
    .assinaturas { display:grid; grid-template-columns:repeat(3,1fr); gap:4mm; margin-top:auto; }
    .assin { border:1.5px solid #000; padding:2.5mm 4mm; }
    .assin label { font-size:7pt; font-weight:700; text-transform:uppercase; display:block; margin-bottom:12mm; }
    .assin-linha { border-top:1px solid #000; font-size:7pt; padding-top:1mm; color:#555; }

    /* ── VERSO (DEFEITOS) ── */
    .verso { margin-top:0; }
    .titulo-verso { text-align:center; font-size:16pt; font-weight:900; text-transform:uppercase; margin-bottom:2mm; }
    .grade { border:1.5px solid #000; display:grid; grid-template-columns:repeat(4,1fr); overflow:hidden; }
    .cat { border-right:1.5px solid #000; border-bottom:1.5px solid #000; display:flex; flex-direction:column; }
    .cat:nth-child(4n) { border-right:none; }
    .cat.ultima { border-bottom:1.5px solid #000; }
    .cat-tit { font-size:8pt; font-weight:700; text-transform:uppercase; text-align:center; padding:2mm; border-bottom:1px solid #000; background:#fafafa; }
    .celulas { display:grid; grid-template-columns:repeat(4,1fr); flex:1; }
    .cel-def { border-right:1px dashed #ccc; border-bottom:1px dashed #ccc; min-height:10mm; }
    .cel-def:nth-child(4n) { border-right:none; }
    .cat.ultima .cel-def:nth-child(n+13) { border-bottom:none; }
    .instrucao { display:flex; align-items:center; justify-content:center; text-align:center; font-size:9pt; font-weight:700; padding:4mm; line-height:1.6; background:#f5f5f5; }
    .grade-footer { border:1.5px solid #000; margin-top:2mm; display:flex; flex-direction:column; }
    .gf-row { display:flex; border-bottom:1.5px solid #000; }
    .gf-row.ultima { border-bottom:none; }
    .gf-cell { border-right:1.5px solid #000; padding:2mm 3mm; height:11mm; display:flex; align-items:center; font-weight:700; font-size:10pt; flex:1; }
    .gf-cell:last-child { border-right:none; }
    .gf-row.head { background:#fafafa; height:auto; }
    .gf-row.head .gf-cell { justify-content:center; font-size:9pt; height:auto; padding:1.5mm; text-transform:uppercase; }
    .rod-info { margin-top:4mm; font-size:7.5pt; font-style:italic; color:#666; }

    /* ── FORMULÁRIO 2 (CLASSIFICAÇÃO) ── */
    .f2 { display:flex; flex-direction:column; gap:2.5mm; flex:1; padding:6mm 8mm; }
    .cab { display:flex; align-items:center; border-bottom:2.5px solid #000; padding-bottom:2mm; gap:5mm; }
    .logo-doptex { height:13mm; width:auto; }
    .titulo-form { font-size:13pt; font-weight:900; text-transform:uppercase; text-align:center; flex:1; letter-spacing:.3px; }
    .dados-box { display:grid; gap:0; border:1px solid #000; }
    .dl1 { grid-template-columns:1fr 2fr 1fr 1fr; }
    .dl2 { grid-template-columns:1fr 1fr; border:1px solid #000; margin-top:2mm; }
    .cel { border-right:1px solid #000; padding:1.5mm 2.5mm; display:flex; flex-direction:column; }
    .cel:last-child { border-right:none; }
    .cel label { font-size:7pt; font-weight:700; color:#444; margin-bottom:.4mm; }
    .cel .v { font-size:11pt; font-weight:700; min-height:6mm; }
    .cel .v.lg { font-size:12pt; }
    .tabela-fusos { display:grid; grid-template-columns:1fr 1fr; gap:3mm; flex:1; }
    table.fusos { width:100%; border-collapse:collapse; }
    table.fusos th { background:#222; color:#fff; padding:2mm 2.5mm; text-align:center; border:1px solid #000; font-size:9pt; font-weight:700; }
    table.fusos td { border:1px solid #000; padding:0 1mm; height:5mm; text-align:center; vertical-align:middle; font-size:8pt; }
    table.fusos td:first-child { font-weight:700; background:#f5f5f5; width:13mm; }
    table.fusos tr.inativo td { background:#f0f0f0; color:#ccc; }
    .rodape { display:grid; grid-template-columns:50px 55px 1fr 1fr 1fr 1fr; gap:0; border:1px solid #000; }
    .rd { border-right:1px solid #000; padding:1.5mm 2mm; }
    .rd:last-child { border-right:none; }
    .rd label { font-size:7pt; font-weight:700; display:block; text-transform:uppercase; }
    .rd .resp { font-size:7.5pt; min-height:7mm; }
    .rd .dl { font-size:7pt; color:#555; border-top:1px solid #ccc; padding-top:.5mm; margin-top:.5mm; }
    .dir { border:1px solid #000; padding:1.5mm 2.5mm; }
    .dir .dh { display:flex; gap:10mm; font-size:8.5pt; font-weight:700; margin-bottom:1.5mm; }
    .obs { border-bottom:1px solid #ccc; height:5.5mm; }
  `

  // ── Grupos de fusos: col1 = fusos 1..36, col2 = fusos 37..72 (sempre 36 linhas fixas)
  const fusoCol1Start = 1
  const fusoCol2Start = 37

  const pagesHtml = `
<!-- PAGINA 1: FORMULARIO 1 — FRENTE -->
<div class="page">
  <div class="f1">
    <div class="titulo">
      <h1>Texturizadora</h1>
      <h2>Placa de Ciclo de Produção</h2>
    </div>
    <div class="grid2">
      <div class="campo"><label>Material</label><div class="v">${emp}</div></div>
      <div class="campo"><label>Lote</label><div class="v">${lote}</div></div>
    </div>
    <div class="campo"><label>Descrição do Material</label><div class="v lg">${desc}</div></div>
    <div class="ciclo-box">
      <div class="esq">
        <div class="label">Ciclo:</div>
        <div class="num">${maqCiclo}</div>
      </div>
      <div class="barcode">
        [código de barras]<br>* ${maqCiclo} *
      </div>
    </div>
    <div class="grid3">
      <div class="campo"><label>Máquina</label><div class="v">${maquina}</div></div>
      <div class="campo"><label>Turno</label><div class="v">&nbsp;</div></div>
      <div class="campo"><label>Data / Hora Ciclo</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="grid3">
      <div class="campo"><label>Responsável</label><div class="v">&nbsp;</div></div>
      <div class="campo"><label>QTDE Bobinas</label><div class="v">&nbsp;</div></div>
      <div class="campo"><label>Peso Bruto</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="checklist">
      <div class="cl-header">Controle de Processo</div>
      <div class="cl-body">
        <div class="cl-item"><label>Máquina</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Aspira Fio</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Confec. Jersei</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Batocagem</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item"><label>Liberação AFT</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <!-- Linha 2 do checklist: Data / Hora / Escolha / Responsável -->
        <div class="cl-item cl-row2"><label>Data</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2"><label>Hora</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2"><label>Escolha</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
        <div class="cl-item cl-row2 cl-span2"><label>Responsável</label><div class="cl-linha"></div><div class="cl-linha"></div><div class="cl-linha"></div></div>
      </div>
    </div>
    <div class="assinaturas">
      <div class="assin"><label>Jersey</label><div class="assin-linha">Assinatura</div></div>
      <div class="assin"><label>Destino</label><div class="assin-linha">Assinatura</div></div>
      <div class="assin"><label>Liberação</label><div class="assin-linha">Assinatura</div></div>
    </div>
  </div>
</div>

<!-- PAGINA 2: FORMULARIO 1 — VERSO (DEFEITOS DE ESCOLHA VISUAL) -->
<div class="page verso">
  <div class="f1" style="gap:0;padding:6mm 14mm 4mm 14mm;">
    <div class="titulo-verso">Defeitos de Escolha Visual</div>
    
    <div class="grade-footer" style="margin-bottom: 4mm;">
      <div class="gf-row head">
        <div class="gf-cell" style="flex: 0 0 28mm;">&nbsp;</div>
        <div class="gf-cell" style="flex: 0 0 38mm;">Data</div>
        <div class="gf-cell" style="flex: 0 0 42mm;">Turma</div>
        <div class="gf-cell">Responsável</div>
      </div>
      <div class="gf-row">
        <div class="gf-cell" style="flex: 0 0 28mm;">Batocagem</div>
        <div class="gf-cell" style="flex: 0 0 38mm;">&nbsp;</div>
        <div class="gf-cell" style="flex: 0 0 42mm;">&nbsp;</div>
        <div class="gf-cell">&nbsp;</div>
      </div>
      <div class="gf-row ultima">
        <div class="gf-cell" style="flex: 0 0 28mm;">Escolha</div>
        <div class="gf-cell" style="flex: 0 0 38mm;">&nbsp;</div>
        <div class="gf-cell" style="flex: 0 0 42mm;">&nbsp;</div>
        <div class="gf-cell">&nbsp;</div>
      </div>
    </div>

    <div class="grade">
      ${defeitos.map(nome => `
        <div class="cat">
          <div class="cat-tit">${nome}</div>
          <div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div>
        </div>
      `).join('')}
      <div class="cat ultima"><div class="cat-tit">Bobinas com Anel</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima"><div class="cat-tit">Bobinas Batidas</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima"><div class="cat-tit">&nbsp;</div><div class="celulas">${Array(16).fill('<div class="cel-def"></div>').join('')}</div></div>
      <div class="cat ultima" style="border-right:none;">
        <div class="instrucao">MARCAR NOS CAMPOS<br>NÚMERO DA BOBINA<br>COM DEFEITO.</div>
      </div>
    </div>

    <div class="rod-info">Qualidade\\padronização\\tietê\\formulários\\FO 02 038- Defeitos de Escolha Visual (folha verso)</div>
  </div>
</div>

<!-- PAGINA 3: FORMULARIO 2 — CLASSIFICAÇÃO VISUAL DE AFINIDADE TINTORIAL -->
<div class="page">
  <div class="f2">
    <div class="cab">
      <img class="logo-doptex" src="${LOGO_DOPTEX_B64}" alt="Doptex">
      <div class="titulo-form">Classificação Visual de Afinidade Tintorial</div>
    </div>
    <div class="dados-box dl1">
      <div class="cel"><label>Maquina</label><div class="v">${maquina}</div></div>
      <div class="cel"><label>Título</label><div class="v lg">${desc}</div></div>
      <div class="cel"><label>Torção</label><div class="v">${torcao}</div></div>
      <div class="cel"><label>Lote</label><div class="v">${lote}</div></div>
    </div>
    <div class="dados-box dl2">
      <div class="cel"><label>DataHoraCiclo</label><div class="v">&nbsp;</div></div>
      <div class="cel"><label>Obs.</label><div class="v">&nbsp;</div></div>
    </div>
    <div class="tabela-fusos">
      <table class="fusos">
        <thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead>
        <tbody>${renderFusoRows(fusoCol1Start, fusos)}</tbody>
      </table>
      <table class="fusos">
        <thead><tr><th>FUSO</th><th>BARRA</th><th>TMT</th></tr></thead>
        <tbody>${renderFusoRows(fusoCol2Start, fusos)}</tbody>
      </table>
    </div>
    <div class="rodape">
      <div class="rd"><label>Máq. Jersey</label><div class="resp">&nbsp;</div></div>
      <div class="rd"><label>Nº Bobinas</label><div class="resp">&nbsp;</div></div>
      <div class="rd"><label>Jersey — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Tingimento — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Conferente — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
      <div class="rd"><label>Liberação — Responsável</label><div class="resp">&nbsp;</div><div class="dl">Data:</div></div>
    </div>
    <div class="dir">
      <div class="dh">
        <span>DIRECIONAMENTO PARA ESCOLHA/EMBALAGEM</span>
        <span>LIDER RESP.: ___________________________</span>
      </div>
      <div class="obs"></div>
      <div class="obs"></div>
    </div>
  </div>
</div>
`

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#fff;'
  container.innerHTML = `<style>${css}</style>${pagesHtml}`
  document.body.appendChild(container)

  try {
    // Aguarda o logo Doptex carregar
    const img = container.querySelector('img.logo-doptex')
    await new Promise(res => {
      if (!img || img.complete) return setTimeout(res, 200)
      img.onload = res
      img.onerror = res
      setTimeout(res, 5000)
    })

    const pages = container.querySelectorAll('.page')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
      })
      if (i > 0) pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297)
    }

    const timestamp = Date.now()
    const sfx = imp ? `__${imp.replace(/[<>:"/\\|?*]/g, '_')}` : ''
    const filename = `F${cicloStr}_${maquina}_${lote}_${timestamp}${sfx}.pdf`
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
